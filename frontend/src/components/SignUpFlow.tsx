import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ArrowLeft, ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { PlaidLinkButton } from './plaid/PlaidLinkButton';
import { PlaidItemsList } from './plaid/PlaidItemsList';
import { usePlaidItems } from '../hooks/usePlaidItems';
import { useAuth } from '../contexts/AuthContext';

interface SignUpFlowProps {
  onNavigate: (screen: string) => void;
}

export default function SignUpFlow({ onNavigate }: SignUpFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { items: plaidItems, loading: plaidLoading, error: plaidError, refresh: refreshPlaidItems } = usePlaidItems();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    creditHistoryAge: '',
    phone: '',
    knowsCreditScore: '',
    creditScore: '',
    travelGoal: '',
    diningGoal: '',
    buildCreditGoal: '',
    cashbackGoal: '',
    onlineShoppingGoal: '',
    // Step 5: Account Creation
    email: '',
    password: '',
    confirmPassword: '',
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleEmailSignUp = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Create Supabase auth user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Step 2: Create profile with ALL collected data
        const profileData = {
          id: data.user.id,
          email: data.user.email!,
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          phone: formData.phone || null,
          creditHistoryAge: formData.creditHistoryAge || null,
          creditScore: formData.creditScore ? parseInt(formData.creditScore) : null,
          knowsCreditScore: formData.knowsCreditScore === 'yes',
          travelGoal: formData.travelGoal || null,
          diningGoal: formData.diningGoal || null,
          buildCreditGoal: formData.buildCreditGoal || null,
          cashbackGoal: formData.cashbackGoal || null,
          onlineShoppingGoal: formData.onlineShoppingGoal || null,
        };

        // DEBUG: Log what we're sending to the backend
        console.log('==================== FRONTEND EMAIL SIGNUP DEBUG ====================');
        console.log('Form Data State:', JSON.stringify(formData, null, 2));
        console.log('Profile Data Being Sent:', JSON.stringify(profileData, null, 2));
        console.log('=====================================================================');

        await api.auth.createProfile(profileData);

        // Navigate to dashboard
        onNavigate('dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      // Store form data in sessionStorage before OAuth redirect
      sessionStorage.setItem('signupFormData', JSON.stringify(formData));

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google signup error:', error);
      alert('Failed to sign up with Google');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-[#4962bf] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 bg-white/5"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <Logo size={60} />
            <div className="text-white">
              Step {currentStep} of {totalSteps}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-white/20 border-2 border-white/40 mb-8 overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: '25%' }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-white mb-6">Basic Information</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white mb-2 block">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white mb-2 block">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-3 block">Credit History Age Range</Label>
                  <RadioGroup
                    value={formData.creditHistoryAge}
                    onValueChange={(value) => handleInputChange('creditHistoryAge', value)}
                    className="space-y-3"
                  >
                    {['Less than 1 year', '1-3 years', '3-5 years', '5+ years', 'No credit history'].map((option) => (
                      <div key={option} className="flex items-center space-x-2 bg-white/10 p-3 rounded-lg border-2 border-white/20">
                        <RadioGroupItem value={option} id={option} className="border-white text-white" />
                        <Label htmlFor={option} className="text-white cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white mb-2 block">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-white mb-6">Credit Profile</h2>
                
                <div>
                  <Label className="text-white mb-3 block">Do you know your credit score?</Label>
                  <RadioGroup
                    value={formData.knowsCreditScore}
                    onValueChange={(value) => handleInputChange('knowsCreditScore', value)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 bg-white/10 p-4 rounded-lg border-2 border-white/20">
                      <RadioGroupItem value="yes" id="yes" className="border-white text-white" />
                      <Label htmlFor="yes" className="text-white cursor-pointer">Yes, I know my credit score</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 p-4 rounded-lg border-2 border-white/20">
                      <RadioGroupItem value="no" id="no" className="border-white text-white" />
                      <Label htmlFor="no" className="text-white cursor-pointer">I don't know my score</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.knowsCreditScore === 'yes' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <Label htmlFor="creditScore" className="text-white mb-2 block">Enter Your Credit Score</Label>
                    <Input
                      id="creditScore"
                      type="number"
                      value={formData.creditScore}
                      onChange={(e) => handleInputChange('creditScore', e.target.value)}
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
                      placeholder="e.g., 720"
                      min="300"
                      max="850"
                    />
                  </motion.div>
                )}

                {formData.knowsCreditScore === 'no' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white/10 p-4 rounded-lg border-2 border-white/20"
                  >
                    <p className="text-white mb-2">Need help finding your credit score?</p>
                    <a href="#" className="text-white underline hover:text-white/80">
                      Learn how to check your credit score →
                    </a>
                  </motion.div>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-white mb-6">Link Bank Accounts</h2>
                
                <div className="bg-white/10 p-6 rounded-lg border-2 border-white/20 space-y-4">
                  <div className="flex items-start gap-4">
                    <CreditCard className="w-8 h-8 text-white flex-shrink-0" />
                    <div className="text-white">
                      <p className="mb-4">
                        We'll use your bank statements to determine spending habits, priorities, and current cards to recommend the best credit cards for you.
                      </p>
                      <p className="text-sm text-white/70">
                        Your data is encrypted and secure. We use Plaid for bank connectivity.
                      </p>
                    </div>
                  </div>

                  <PlaidLinkButton
                    buttonText="Connect Bank Account with Plaid"
                    onSuccess={refreshPlaidItems}
                    className="w-full bg-white text-[#4962bf] hover:bg-white/90"
                  />
                </div>

                <div className="bg-white/5 border-2 border-white/20 rounded-xl p-4">
                  <PlaidItemsList
                    items={plaidItems}
                    loading={plaidLoading}
                    error={plaidError}
                    onRemove={async (itemId) => {
                      await api.plaid.removeItem(itemId);
                      await refreshPlaidItems();
                    }}
                    onRefresh={refreshPlaidItems}
                  />
                </div>

                <button className="text-white/70 hover:text-white underline text-sm">
                  Skip for now
                </button>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-white mb-6">Future Goals</h2>

                <p className="text-white/80 mb-6">
                  Tell us about your financial aspirations to get personalized recommendations:
                </p>

                {error && (
                  <div className="bg-red-500/20 border-2 border-red-500/50 rounded-lg p-3 mb-4">
                    <p className="text-white text-sm text-center">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="bg-white/10 p-4 rounded-lg border-2 border-white/20">
                    <Label className="text-white mb-3 block">Would you like to travel more?</Label>
                    <RadioGroup
                      value={formData.travelGoal}
                      onValueChange={(value) => handleInputChange('travelGoal', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="travel-yes" className="border-white text-white" />
                        <Label htmlFor="travel-yes" className="text-white cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="travel-no" className="border-white text-white" />
                        <Label htmlFor="travel-no" className="text-white cursor-pointer">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="maybe" id="travel-maybe" className="border-white text-white" />
                        <Label htmlFor="travel-maybe" className="text-white cursor-pointer">Maybe</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg border-2 border-white/20">
                    <Label className="text-white mb-3 block">Do you see yourself spending more on food & dining?</Label>
                    <RadioGroup
                      value={formData.diningGoal}
                      onValueChange={(value) => handleInputChange('diningGoal', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="dining-yes" className="border-white text-white" />
                        <Label htmlFor="dining-yes" className="text-white cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="dining-no" className="border-white text-white" />
                        <Label htmlFor="dining-no" className="text-white cursor-pointer">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="maybe" id="dining-maybe" className="border-white text-white" />
                        <Label htmlFor="dining-maybe" className="text-white cursor-pointer">Maybe</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg border-2 border-white/20">
                    <Label className="text-white mb-3 block">Do you want to build credit for a loan?</Label>
                    <RadioGroup
                      value={formData.buildCreditGoal}
                      onValueChange={(value) => handleInputChange('buildCreditGoal', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="credit-yes" className="border-white text-white" />
                        <Label htmlFor="credit-yes" className="text-white cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="credit-no" className="border-white text-white" />
                        <Label htmlFor="credit-no" className="text-white cursor-pointer">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="maybe" id="credit-maybe" className="border-white text-white" />
                        <Label htmlFor="credit-maybe" className="text-white cursor-pointer">Maybe</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg border-2 border-white/20">
                    <Label className="text-white mb-3 block">Are you interested in cashback rewards?</Label>
                    <RadioGroup
                      value={formData.cashbackGoal}
                      onValueChange={(value) => handleInputChange('cashbackGoal', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="cashback-yes" className="border-white text-white" />
                        <Label htmlFor="cashback-yes" className="text-white cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="cashback-no" className="border-white text-white" />
                        <Label htmlFor="cashback-no" className="text-white cursor-pointer">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="maybe" id="cashback-maybe" className="border-white text-white" />
                        <Label htmlFor="cashback-maybe" className="text-white cursor-pointer">Maybe</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg border-2 border-white/20">
                    <Label className="text-white mb-3 block">Do you frequently shop online?</Label>
                    <RadioGroup
                      value={formData.onlineShoppingGoal}
                      onValueChange={(value) => handleInputChange('onlineShoppingGoal', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="online-yes" className="border-white text-white" />
                        <Label htmlFor="online-yes" className="text-white cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="online-no" className="border-white text-white" />
                        <Label htmlFor="online-no" className="text-white cursor-pointer">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="maybe" id="online-maybe" className="border-white text-white" />
                        <Label htmlFor="online-maybe" className="text-white cursor-pointer">Maybe</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium mb-4 text-white">Create Your Account</h3>
                  <p className="text-sm text-white/80 mb-6">
                    Final step! Choose how you'd like to create your account.
                  </p>
                </div>

                {/* Google Sign Up */}
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-white text-[#4962bf] hover:bg-white/90"
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/30" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#4962bf] px-2 text-white/70">Or continue with email</span>
                    </div>
                  </div>
                </div>

                {/* Email/Password Sign Up */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-white mb-2 block">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
                      placeholder="Create a password (min 6 characters)"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-white mb-2 block">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>

                  <Button
                    className="w-full bg-white text-[#4962bf] hover:bg-white/90"
                    onClick={handleEmailSignUp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
              variant="outline"
              className="bg-white/20 border-white/40 text-white hover:bg-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {currentStep < totalSteps && (
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="bg-white text-[#4962bf] hover:bg-white/90"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
