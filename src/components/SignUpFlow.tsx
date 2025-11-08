import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';

interface SignUpFlowProps {
  onNavigate: (screen: string) => void;
}

export default function SignUpFlow({ onNavigate }: SignUpFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    creditHistoryAge: '',
    phone: '',
    knowsCreditScore: '',
    creditScore: '',
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onNavigate('dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: string) => {
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
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white mb-2 block">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-3 block">Credit History Age Range</Label>
                  <RadioGroup
                    value={formData.creditHistoryAge}
                    onValueChange={(value) => updateFormData('creditHistoryAge', value)}
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
                    onChange={(e) => updateFormData('phone', e.target.value)}
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
                    onValueChange={(value) => updateFormData('knowsCreditScore', value)}
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
                      onChange={(e) => updateFormData('creditScore', e.target.value)}
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
                
                <div className="bg-white/10 p-6 rounded-lg border-2 border-white/20">
                  <div className="flex items-start gap-4 mb-6">
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

                  <Button className="w-full bg-white text-[#4962bf] hover:bg-white/90">
                    Connect Bank Account with Plaid
                  </Button>
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

                <div className="space-y-4">
                  {[
                    'Would you like to travel more?',
                    'Do you see yourself spending more on food & dining?',
                    'Do you want to build credit for a loan?',
                    'Are you interested in cashback rewards?',
                    'Do you frequently shop online?',
                  ].map((question) => (
                    <div key={question} className="bg-white/10 p-4 rounded-lg border-2 border-white/20">
                      <Label className="text-white mb-3 block">{question}</Label>
                      <RadioGroup className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id={`${question}-yes`} className="border-white text-white" />
                          <Label htmlFor={`${question}-yes`} className="text-white cursor-pointer">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id={`${question}-no`} className="border-white text-white" />
                          <Label htmlFor={`${question}-no`} className="text-white cursor-pointer">No</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="maybe" id={`${question}-maybe`} className="border-white text-white" />
                          <Label htmlFor={`${question}-maybe`} className="text-white cursor-pointer">Maybe</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={handleBack}
              disabled={currentStep === 1}
              variant="outline"
              className="bg-white/20 border-white/40 text-white hover:bg-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-white text-[#4962bf] hover:bg-white/90"
            >
              {currentStep === totalSteps ? 'Finish' : 'Next'}
              {currentStep < totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
