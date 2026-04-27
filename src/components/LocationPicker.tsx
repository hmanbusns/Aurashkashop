import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Crosshair, X, ChevronRight, Navigation, Phone, Mail, User } from 'lucide-react';
import { Address, UserProfile } from '../types';
import { AuthService } from '../services/authService';

interface LocationPickerProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProfile: UserProfile) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ user, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'choice' | 'form'>('choice');
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [formData, setFormData] = useState<Address>({
    fullName: user.displayName || '',
    phone: user.phone || '',
    email: user.email || '',
    street: '',
    city: '',
    district: '',
    state: '',
    pincode: ''
  });

  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);

  const handleAutoDetect = async () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          // In a real app, we'd use reverse geocoding here
          setStep('form');
        } catch (error) {
          console.error("Geocoding failed", error);
          setStep('form');
        } finally {
          setLoading(false);
        }
      }, (error) => {
        console.error("Geolocation error", error);
        setStep('form');
        setLoading(false);
      });
    } else {
      setStep('form');
      setLoading(false);
    }
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length > 6) return;
    
    setFormData(prev => ({ ...prev, pincode: val }));
    setCitySuggestions([]);

    if (val.length === 6) {
      setPincodeLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await response.json();
        if (data[0].Status === 'Success') {
          const offices = data[0].PostOffice;
          const first = offices[0];
          setFormData(prev => ({
            ...prev,
            district: first.District,
            state: first.State,
            city: first.Name
          }));
          setCitySuggestions(offices.map((o: any) => o.Name));
        }
      } catch (error) {
        console.error("Pincode API failed", error);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedProfile = await AuthService.updateUserProfile(user.uid, {
        address: formData
      });
      if (updatedProfile) {
        onSuccess(updatedProfile);
        onClose();
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-background border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif text-cream font-bold">Delivery Location</h2>
          </div>
          <button onClick={onClose} className="p-2 text-cream/20 hover:text-cream">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'choice' ? (
            <div className="space-y-4">
              <p className="text-cream/40 text-sm mb-6">Where should we deliver your botanical treasures?</p>
              
              <button 
                onClick={handleAutoDetect}
                disabled={loading}
                className="w-full p-6 bg-surface/50 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-primary/50 transition-all text-left group"
              >
                <div className="p-4 bg-primary text-background rounded-2xl group-hover:scale-110 transition-transform">
                  <Crosshair className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-cream font-bold mb-1">Use Current Location</h4>
                  <p className="text-cream/30 text-xs">Fastest way to get your location</p>
                </div>
                <ChevronRight className="w-5 h-5 text-cream/20" />
              </button>

              <button 
                onClick={() => setStep('form')}
                className="w-full p-6 bg-surface/30 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-primary/50 transition-all text-left group"
              >
                <div className="p-4 bg-cream/10 text-cream rounded-2xl group-hover:scale-110 transition-transform">
                  <Navigation className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-cream font-bold mb-1">Manually Enter Address</h4>
                  <p className="text-cream/30 text-xs">Fill in your address details</p>
                </div>
                <ChevronRight className="w-5 h-5 text-cream/20" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 h-[60vh] overflow-y-auto no-scrollbar pr-1">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-cream/40 font-bold ml-2">Personal Details</label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/20" />
                    <input 
                      required
                      type="text"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-surface/50 border border-white/5 rounded-2xl text-cream text-sm outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/20" />
                    <input 
                      required
                      type="tel"
                      placeholder="Mobile Number"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-surface/50 border border-white/5 rounded-2xl text-cream text-sm outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/20" />
                    <input 
                      required
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-surface/50 border border-white/5 rounded-2xl text-cream text-sm outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1 mt-6">
                <label className="text-[10px] uppercase tracking-widest text-cream/40 font-bold ml-2">Address Details</label>
                <div className="space-y-3">
                  <input 
                    required
                    type="text"
                    placeholder="Street / House No / Landmark"
                    value={formData.street}
                    onChange={e => setFormData({...formData, street: e.target.value})}
                    className="w-full px-4 py-3 bg-surface/50 border border-white/5 rounded-2xl text-cream text-sm outline-none focus:border-primary/50"
                  />
                  
                  <div className="relative">
                    <input 
                      required
                      type="text"
                      maxLength={6}
                      placeholder="Pincode"
                      value={formData.pincode}
                      onChange={handlePincodeChange}
                      className="w-full px-4 py-3 bg-surface/50 border border-white/5 rounded-2xl text-cream text-sm outline-none focus:border-primary/50"
                    />
                    {pincodeLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input 
                        required
                        type="text"
                        placeholder="City/Village"
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        className="w-full px-4 py-3 bg-surface/50 border border-white/5 rounded-2xl text-cream text-sm outline-none focus:border-primary/50"
                      />
                      {citySuggestions.length > 1 && (
                        <div className="absolute top-full left-0 right-0 z-50 bg-surface border border-white/10 rounded-xl mt-1 max-h-40 overflow-y-auto shadow-2xl">
                          {citySuggestions.map((city, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, city }));
                                setCitySuggestions([]);
                              }}
                              className="w-full text-left px-4 py-2 text-xs text-cream/70 hover:bg-primary/10 hover:text-primary transition-colors border-b border-white/5 last:border-0"
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input 
                      required
                      type="text"
                      placeholder="District"
                      value={formData.district}
                      onChange={e => setFormData({...formData, district: e.target.value})}
                      className="w-full px-4 py-3 bg-surface/50 border border-white/5 rounded-2xl text-cream text-sm outline-none focus:border-primary/50"
                    />
                  </div>
                  
                  <input 
                    required
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={e => setFormData({...formData, state: e.target.value})}
                    className="w-full px-4 py-3 bg-surface/50 border border-white/5 rounded-2xl text-cream text-sm outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-background font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving Address...' : 'Securely Save Address'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
