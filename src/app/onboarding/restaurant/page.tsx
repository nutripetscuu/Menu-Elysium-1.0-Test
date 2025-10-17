'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coffee, AlertCircle, ArrowRight, ArrowLeft, Upload } from 'lucide-react';
import { useOnboarding } from '@/contexts/onboarding-context';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';

const cuisineTypes = [
  'American',
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Thai',
  'Indian',
  'French',
  'Mediterranean',
  'Korean',
  'Vietnamese',
  'Greek',
  'Spanish',
  'Brazilian',
  'Middle Eastern',
  'Caribbean',
  'Fusion',
  'Seafood',
  'Steakhouse',
  'Vegetarian/Vegan',
  'Fast Food',
  'Cafe/Coffee Shop',
  'Bakery',
  'Other',
];

export default function RestaurantInfoPage() {
  const router = useRouter();
  const { restaurantData, setRestaurantData, currentStep, nextStep, previousStep } = useOnboarding();

  const [restaurantName, setRestaurantName] = useState(restaurantData.restaurantName);
  const [businessName, setBusinessName] = useState(restaurantData.businessName);
  const [phone, setPhone] = useState(restaurantData.phone);
  const [email, setEmail] = useState(restaurantData.email);
  const [addressLine1, setAddressLine1] = useState(restaurantData.addressLine1);
  const [addressLine2, setAddressLine2] = useState(restaurantData.addressLine2);
  const [city, setCity] = useState(restaurantData.city);
  const [state, setState] = useState(restaurantData.state);
  const [postalCode, setPostalCode] = useState(restaurantData.postalCode);
  const [country, setCountry] = useState(restaurantData.country);
  const [cuisineType, setCuisineType] = useState<string[]>(restaurantData.cuisineType);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(restaurantData.logoUrl);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    setError('');

    if (!restaurantName || !phone || !email || !addressLine1 || !city || !state || !postalCode) {
      setError('Please fill in all required fields');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }

    if (cuisineType.length === 0) {
      setError('Please select at least one cuisine type');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Save to context (operatingHours will use defaults from context)
    setRestaurantData({
      restaurantName,
      businessName,
      phone,
      email,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      cuisineType,
      operatingHours: restaurantData.operatingHours, // Preserve existing operating hours
      logoUrl: logoPreview,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Move to next step
    nextStep();
    router.push('/onboarding/subdomain');
  };

  const handleBack = () => {
    previousStep();
    router.push('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#F0F2F5]">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container max-w-4xl mx-auto py-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-[#C41E3A]" />
            <span className="text-xl font-bold text-[#0B2C4D]">NoWaiter</span>
          </Link>
        </div>
      </div>

      {/* Progress */}
      <OnboardingProgress currentStep={currentStep} />

      {/* Form */}
      <div className="container max-w-2xl mx-auto px-4 pb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Restaurant Information</CardTitle>
            <CardDescription>
              Tell us about your restaurant so we can set up your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Restaurant Logo (Optional)</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="w-20 h-20 rounded-lg border overflow-hidden">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo')?.click()}
                      disabled={loading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Restaurant Name *</Label>
                  <Input
                    id="restaurantName"
                    placeholder="The Golden Fork"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Legal Business Name (Optional)</Label>
                  <Input
                    id="businessName"
                    placeholder="Golden Fork LLC"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Restaurant Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Restaurant Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@restaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    placeholder="123 Main Street"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input
                    id="addressLine2"
                    placeholder="Suite 100"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      placeholder="10001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Cuisine Type */}
              <div className="space-y-2">
                <Label htmlFor="cuisineType">Cuisine Type *</Label>
                <Select
                  value={cuisineType[0] || ''}
                  onValueChange={(value) => setCuisineType([value])}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisineTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  You can add more cuisine types later
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-[#C41E3A] hover:bg-[#C41E3A]/90 text-white">
                  {loading ? (
                    <>Saving...</>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
