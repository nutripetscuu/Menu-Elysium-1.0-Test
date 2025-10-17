'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  getSettings,
  updateSettings as updateSettingsAction,
  getMenuUrl,
  getRestaurantSubdomain
} from '@/lib/actions/settings';
import type { RestaurantSettings, BusinessHours } from '@/lib/api/settings';
import { generateQRCodeDataURL, downloadQRCodeClient } from '@/lib/utils/download-qr-code-client';

export default function SettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [menuUrl, setMenuUrl] = useState<string>('');

  // Form state
  const [restaurantName, setRestaurantName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [onlineOrderingEnabled, setOnlineOrderingEnabled] = useState(true);
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#B0C4DE');
  const [secondaryColor, setSecondaryColor] = useState('#1a1a1a');
  const [fontFamily, setFontFamily] = useState('Inter');

  // Load settings
  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await getSettings();

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load settings');
      }

      const data = response.data;
      setSettings(data);
      setRestaurantName(data.restaurant_name);
      setWhatsappNumber(data.whatsapp_number || '');
      setOnlineOrderingEnabled(data.online_ordering_enabled);
      setBusinessHours(data.business_hours);
      setLogoUrl(data.logo_url);
      setPrimaryColor(data.primary_color);
      setSecondaryColor(data.secondary_color);
      setFontFamily(data.font_family);

      // Generate QR code using multi-tenant safe functions
      const url = await getMenuUrl();
      setMenuUrl(url);
      if (url) {
        const qr = await generateQRCodeDataURL(url);
        setQrCodeUrl(qr);
      }
    } catch (error) {
      console.error('Load error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Handle save settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await updateSettingsAction({
        restaurant_name: restaurantName,
        whatsapp_number: whatsappNumber || null,
        online_ordering_enabled: onlineOrderingEnabled,
        business_hours: businessHours || undefined,
        logo_url: logoUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        font_family: fontFamily,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to save settings');
      }

      toast.success('Settings saved successfully');
      loadSettings();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'logos');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || 'Failed to upload logo');
      }

      setLogoUrl(result.data);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setLogoUploading(false);
    }
  };

  // Handle download QR code
  const handleDownloadQR = async () => {
    try {
      const [url, subdomain] = await Promise.all([
        getMenuUrl(),
        getRestaurantSubdomain()
      ]);
      await downloadQRCodeClient(url, subdomain);
      toast.success('QR code downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download QR code');
    }
  };

  // Handle regenerate QR code
  const handleRegenerateQR = async () => {
    try {
      const url = await getMenuUrl();
      const qr = await generateQRCodeDataURL(url);
      setQrCodeUrl(qr);
      setMenuUrl(url);
      toast.success('QR code regenerated');
    } catch (error) {
      console.error('Regenerate error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate QR code');
    }
  };

  // Update business hours
  const updateDayHours = (day: keyof BusinessHours, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    if (!businessHours) return;
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage restaurant configuration and preferences
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="hours">Business Hours</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic restaurant information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Restaurant Name */}
              <div>
                <Label htmlFor="restaurant_name">Restaurant Name</Label>
                <Input
                  id="restaurant_name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Elysium Café"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+1234567890"
                  type="tel"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: +[country code][number] (e.g., +1234567890)
                </p>
              </div>

              {/* Online Ordering Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="online_ordering">Online Ordering</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable customers to place orders through WhatsApp
                  </p>
                </div>
                <Switch
                  id="online_ordering"
                  checked={onlineOrderingEnabled}
                  onCheckedChange={setOnlineOrderingEnabled}
                />
              </div>

              {/* Menu URL (read-only) */}
              <div>
                <Label>Public Menu URL</Label>
                <Input
                  value={menuUrl}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Share this URL with customers to view your menu
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize your restaurant's appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Upload */}
              <div>
                <Label htmlFor="logo">Restaurant Logo</Label>
                <div className="mt-2 space-y-2">
                  {logoUrl && (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                      <img src={logoUrl} alt="Restaurant logo" className="object-contain w-full h-full" />
                    </div>
                  )}
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={logoUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: Square image, max 2MB
                  </p>
                </div>
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#B0C4DE"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#1a1a1a"
                    />
                  </div>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <Label htmlFor="font_family">Font Family</Label>
                <select
                  id="font_family"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border rounded-md"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours Tab */}
        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Set your restaurant's operating hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {businessHours && Object.entries(businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-32">
                    <Label className="capitalize">{day}</Label>
                  </div>
                  <Switch
                    checked={!hours.closed}
                    onCheckedChange={(checked) => updateDayHours(day as keyof BusinessHours, 'closed', !checked)}
                  />
                  {!hours.closed && (
                    <>
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateDayHours(day as keyof BusinessHours, 'open', e.target.value)}
                        className="w-32"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateDayHours(day as keyof BusinessHours, 'close', e.target.value)}
                        className="w-32"
                      />
                    </>
                  )}
                  {hours.closed && (
                    <span className="text-muted-foreground">Closed</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* QR Code Tab */}
        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>Generate and download QR code for your menu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCodeUrl && (
                <div className="flex flex-col items-center gap-4">
                  <img src={qrCodeUrl} alt="Menu QR Code" className="w-64 h-64 border rounded-lg" />
                  <div className="flex gap-2">
                    <Button onClick={handleDownloadQR} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download QR Code
                    </Button>
                    <Button onClick={handleRegenerateQR} variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    <p>Scan this QR code to access your menu</p>
                    <p className="font-mono mt-1">{menuUrl}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
