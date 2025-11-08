-- 01_ingest_cards.sql
create or replace function ingest_cards_json(cards jsonb)
returns jsonb
language plpgsql
as $$
declare
  v_now timestamptz := now();
  v_report jsonb := '[]'::jsonb;
  c jsonb;
  card_row record;
  cid text;
  v_cards jsonb := coalesce(cards->'cards','[]'::jsonb);
begin
  if jsonb_typeof(v_cards) <> 'array' then
    raise exception 'payload.cards must be an array';
  end if;

  for card_row in
    select value
    from jsonb_array_elements(v_cards)
  loop
    c := card_row.value;

    -- upsert catalog (conflict on issuer+name will return the existing or new id)
    insert into "CardsCatalog" as cc(
      id, name, issuer, network, "isChargeCard",
      "annualFeeCents", "feeCreditsCents", "minScoreBand",
      "valuationCpp", active, "sourceUrl", "termsUrl",
      "lastVerifiedAt", "cardMetadata", "createdAt", "updatedAt"
    ) values (
      gen_random_uuid(),
      c->>'name',
      c->>'issuer',
      upper(c->>'network')::"CardNetwork",
      coalesce((c->>'isChargeCard')::boolean, false),
      coalesce((c->>'annualFeeCents')::int, 0),
      coalesce((c#>>'{feeCredits,totalAnnualCreditsCents}')::int, 0),
      nullif(c->>'minScoreBand','')::"ScoreBand",
      nullif(c->>'valuationCpp','')::numeric,
      coalesce((c->>'active')::boolean, true),
      coalesce(c->>'sourceUrl', c#>>'{scraping,sourceUrl}'),
      coalesce(c->>'termsUrl',  c#>>'{scraping,termsUrl}'),
      (c#>>'{scraping,lastVerifiedAt}')::timestamptz,
      c,
      v_now,
      v_now
    )
    on conflict (issuer, name) do update
      set name = excluded.name,
          network = excluded.network,
          "isChargeCard" = excluded."isChargeCard",
          "annualFeeCents" = excluded."annualFeeCents",
          "feeCreditsCents" = excluded."feeCreditsCents",
          "minScoreBand" = excluded."minScoreBand",
          "valuationCpp" = excluded."valuationCpp",
          active = excluded.active,
          "sourceUrl" = excluded."sourceUrl",
          "termsUrl" = excluded."termsUrl",
          "lastVerifiedAt" = excluded."lastVerifiedAt",
          "cardMetadata" = excluded."cardMetadata",
          "updatedAt" = v_now
    returning id into cid;

    -- wipe children
    delete from "CardEarnRate" where "cardId" = cid;
    delete from "CardBonus"    where "cardId" = cid;
    delete from "CardPacing"   where "cardId" = cid;
    delete from "CardAPR"      where "cardId" = cid;
    delete from "CardFees"     where "cardId" = cid;
    delete from "CardEligibility" where "cardId" = cid;
    delete from "CardBenefit"  where "cardId" = cid;
    delete from "CardTransferPartner" where "cardId" = cid;
    delete from "CardRotatingSchedule" where "cardId" = cid;
    delete from "CardAsset"    where "cardId" = cid;

    -- earn rates
    insert into "CardEarnRate"("id","cardId","category","ratePct","capAmountCents","capWindowMonths","merchantsInclude","note","isRotating")
    select gen_random_uuid(), cid,
           (er->>'category')::"Category",
           nullif(er->>'ratePct','')::numeric,
           nullif(er#>>'{cap,amountCents}','')::int,
           nullif(er#>>'{cap,windowMonths}','')::int,
           case when jsonb_typeof(er->'merchantsInclude')='array' then er->'merchantsInclude' else null end,
           er->>'note',
           coalesce((er->>'isRotating')::boolean, false)
    from jsonb_array_elements(coalesce(c#>'{rewards,earnRates}','[]'::jsonb)) er;

    -- add baseRatePct as general category if it exists and no general category already defined
    if (c#>>'{rewards,baseRatePct}') is not null
       and not exists (
         select 1 from "CardEarnRate"
         where "cardId" = cid and category = 'general'
       ) then
      insert into "CardEarnRate"("id","cardId","category","ratePct","note","isRotating")
      values (gen_random_uuid(), cid, 'general',
              nullif(c#>>'{rewards,baseRatePct}','')::numeric,
              'Base rate on all purchases', false);
    end if;

    -- bonuses
    insert into "CardBonus"("id","cardId","kind","points","cashCents","windowMonths","minSpendCents","expirationText","footnotes")
    select gen_random_uuid(), cid,
           upper(coalesce(b->>'kind','WELCOME'))::"BonusKind",
           nullif(b->>'points','')::int,
           nullif(b->>'cashCents','')::int,
           coalesce(nullif(b->>'windowMonths','')::int, 0),
           coalesce(nullif(b->>'minSpendCents','')::int, 0),
           b->>'expirationText',
           coalesce(
             array(
               select value::text
               from jsonb_array_elements_text(coalesce(b->'footnotes','[]'::jsonb))
             ),
             '{}'::text[]
           )
    from jsonb_array_elements(coalesce(c->'bonuses','[]'::jsonb)) b;

    -- pacing
    if (c#>>'{pacing,minDaysBetweenNewCards}') is not null then
      insert into "CardPacing"("cardId","minDaysBetweenNewCards")
      values (cid, (c#>>'{pacing,minDaysBetweenNewCards}')::int)
      on conflict ("cardId") do update set "minDaysBetweenNewCards" = excluded."minDaysBetweenNewCards";
    end if;

    -- apr
    if c ? 'apr' then
      insert into "CardAPR"("cardId",
        "purchaseAPRMinPct","purchaseAPRMaxPct","purchaseAPRType","indexName",
        "btAPRMinPct","btAPRMaxPct","introBtPct","introBtMonths","introBtFeePct","introBtFeeMinCents",
        "cashAdvanceAPR","penaltyAPR")
      values (
        cid,
        nullif(c#>>'{apr,purchaseAPR,rangePct,min}','')::numeric,
        nullif(c#>>'{apr,purchaseAPR,rangePct,max}','')::numeric,
        c#>>'{apr,purchaseAPR,type}',
        c#>>'{apr,purchaseAPR,index}',
        nullif(c#>>'{apr,balanceTransferAPR,rangePct,min}','')::numeric,
        nullif(c#>>'{apr,balanceTransferAPR,rangePct,max}','')::numeric,
        nullif(c#>>'{apr,balanceTransferAPR,introOffer,introPct}','')::numeric,
        nullif(c#>>'{apr,balanceTransferAPR,introOffer,introMonths}','')::int,
        nullif(c#>>'{apr,balanceTransferAPR,introOffer,fee,pct}','')::numeric,
        nullif(c#>>'{apr,balanceTransferAPR,introOffer,fee,minCents}','')::int,
        nullif(c#>>'{apr,cashAdvanceAPR,pct}','')::numeric,
        nullif(c#>>'{apr,penaltyAPR,pct}','')::numeric
      );
    end if;

    -- fees
    if c ? 'fees' then
      insert into "CardFees"("cardId","foreignTransactionType","foreignTransactionPct",
                             "balanceTransferFeePct","balanceTransferFeeMinCents",
                             "cashAdvanceFeePct","cashAdvanceFeeMinCents","lateFeeCents","returnedPaymentFeeCents")
      values (
        cid,
        case upper(coalesce(c#>>'{fees,foreignTransaction,type}','NONE')) when 'PERCENT' then 'PERCENT' else 'NONE' end::"ForeignTxnType",
        nullif(c#>>'{fees,foreignTransaction,pct}','')::numeric,
        nullif(c#>>'{fees,balanceTransferFee,pct}','')::numeric,
        nullif(c#>>'{fees,balanceTransferFee,minCents}','')::int,
        nullif(c#>>'{fees,cashAdvanceFee,pct}','')::numeric,
        nullif(c#>>'{fees,cashAdvanceFee,minCents}','')::int,
        nullif(c#>>'{fees,lateFeeCents}','')::int,
        nullif(c#>>'{fees,returnedPaymentFeeCents}','')::int
      );
    end if;

    -- eligibility
    if c ? 'eligibility' then
      insert into "CardEligibility"("cardId","suggestedHistoryYears","utilizationNote","otherNotes")
      values (
        cid,
        nullif(c#>>'{eligibility,suggestedHistoryYears}','')::int,
        c#>>'{eligibility,utilizationNote}',
        coalesce(
          array(
            select value::text
            from jsonb_array_elements_text(coalesce(c#>'{eligibility,otherNotes}','[]'::jsonb))
          ),
          '{}'::text[]
        )
      );
    end if;

    -- benefits
    insert into "CardBenefit"("id","cardId","label","section","priority")
    select gen_random_uuid(), cid, btxt, null, rn
    from (
      select value::text as btxt, row_number() over () as rn
      from jsonb_array_elements_text(coalesce(c->'benefits','[]'::jsonb))
    ) s;

    -- partners
    insert into "CardTransferPartner"("id","cardId","program","ratioFrom","ratioTo","multiplier","note")
    select gen_random_uuid(), cid, p->>'program',
           nullif(p->>'ratioFrom','')::int, nullif(p->>'ratioTo','')::int,
           nullif(p->>'multiplier','')::numeric, p->>'note'
    from jsonb_array_elements(coalesce(c#>'{rewards,transferPartners}','[]'::jsonb)) p;

    -- rotating
    insert into "CardRotatingSchedule"("id","cardId","scheduleNote","year","quarter","categories")
    select gen_random_uuid(), cid, coalesce(c#>>'{rewards,rotatingCategories,scheduleNote}', null),
           nullif(w->>'year','')::int, nullif(w->>'quarter','')::int,
           array(select x from jsonb_array_elements_text(coalesce(w->'categories','[]'::jsonb)) x)
    from jsonb_array_elements(coalesce(c#>'{rewards,rotatingCategories,windows}','[]'::jsonb)) w;

    -- assets
    if (c#>>'{images,cardArtUrl}') is not null then
      insert into "CardAsset"("id","cardId","cardArtUrl")
      values (gen_random_uuid(), cid, c#>>'{images,cardArtUrl}');
    end if;

    v_report := v_report || jsonb_build_array(jsonb_build_object('id', cid::text, 'name', c->>'name'));
  end loop;

  return jsonb_build_object('ingested', v_report, 'count', jsonb_array_length(v_report));
end;
$$;
