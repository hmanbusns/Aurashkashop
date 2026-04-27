import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Crosshair, X, ChevronRight, Navigation, Phone, Mail, User, Trash2, Edit2, Check, Plus } from 'lucide-react';
import { Address, UserProfile } from '../types';
import { AuthService } from '../services/authService';

interface LocationPickerProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProfile: UserProfile) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ user, isOpen, onClose, onSuccess }) => {
  const [view, setView] = useState<'list' | 'choice' | 'form'>('list');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  const initialFormState: Address = {
    fullName: user.displayName || '',
    phone: user.phone || '',
    email: user.email || '',
    street: '',
    city: '',
    district: '',
    state: '',
    pincode: ''
  };

  const [formData, setFormData] = useState<Address>(initialFormState);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);

  const indianStates = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAddresses();
    }
  }, [isOpen, user.uid]);

  const loadAddresses = async () => {
    const list = await AuthService.getAddresses(user.uid);
    setAddresses(list);
    if (view === 'list' && list.length === 0 && !user.address) {
      setView('choice');
    }
  };

  const handleAutoDetect = async () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          
          if (data.address) {
            const addr = data.address;
            
            let detectedState = addr.state || '';
            const matchedState = indianStates.find(s => s.toLowerCase() === detectedState.toLowerCase());
            if (matchedState) detectedState = matchedState;

            setFormData(prev => ({
              ...prev,
              fullName: prev.fullName || user.displayName || '',
              phone: prev.phone || user.phone || '',
              street: addr.road || addr.suburb || addr.neighbourhood || '',
              city: addr.city || addr.town || addr.village || '',
              district: addr.city_district || addr.county || '',
              state: detectedState,
              pincode: addr.postcode ? addr.postcode.split(',')[0].replace(/\D/g, '') : ''
            }));
            
            setView('form');
          }
        } catch (error) {
          console.error("Geocoding failed", error);
          setView('form');
        } finally {
          setLoading(false);
        }
      }, (error) => {
        console.error("Geolocation error", error);
        alert("Please enable location permissions in your browser settings to use this feature.");
        setView('form');
        setLoading(false);
      }, { enableHighAccuracy: true });
    } else {
      setView('form');
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
          
          let detectedState = first.State;
          const matchedState = indianStates.find(s => s.toLowerCase() === detectedState.toLowerCase());
          if (matchedState) detectedState = matchedState;

          setFormData(prev => ({
            ...prev,
            district: first.District,
            state: detectedState,
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
      if (editingAddressId) {
        await AuthService.updateAddress(user.uid, editingAddressId, formData);
      } else {
        await AuthService.addAddress(user.uid, formData);
      }
      const updatedProfile = await AuthService.getUserProfile(user.uid);
      if (updatedProfile) {
        onSuccess(updatedProfile);
        loadAddresses();
        setView('list');
        setEditingAddressId(null);
        setFormData(initialFormState);
      }
    } catch (error) {
      console.error("Failed to save address", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = async (address: Address) => {
    setLoading(true);
    try {
      const updatedProfile = await AuthService.updateUserProfile(user.uid, { address });
      if (updatedProfile) {
        onSuccess(updatedProfile);
        onClose();
      }
    } catch (error) {
      console.error("Failed to set primary address", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);

    // Optimistic update
    const previousAddresses = [...addresses];
    setAddresses(prev => prev.filter(a => a.id !== id));
    
    try {
      await AuthService.deleteAddress(user.uid, id);
      const updatedProfile = await AuthService.getUserProfile(user.uid);
      if (updatedProfile) {
        onSuccess(updatedProfile);
      }
    } catch (error) {
      console.error("Delete failed", error);
      setAddresses(previousAddresses);
      alert("Failed to delete address. Please try again.");
    }
  };

  const handleEdit = (e: React.MouseEvent, address: Address) => {
    e.stopPropagation();
    setFormData(address);
    setEditingAddressId(address.id!);
    setView('form');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-background border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        <div className="p-5 border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif text-cream font-bold">
              {view === 'list' ? 'Your Addresses' : view === 'choice' ? 'Set Delivery Location' : editingAddressId ? 'Edit Address' : 'New Address'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-cream/20 hover:text-cream">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          <AnimatePresence>
            {confirmDeleteId && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-0 z-[110] bg-background/95 backdrop-blur-sm flex items-center justify-center p-8 text-center fix-glitch"
              >
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cream mb-2">Delete Address?</h3>
                    <p className="text-cream/50 text-xs">This action cannot be undone. Are you sure you want to remove this address?</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex-1 py-3 bg-surface border border-white/5 rounded-xl text-cream text-[10px] uppercase font-bold tracking-widest"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmDelete}
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] uppercase font-bold tracking-widest shadow-xl shadow-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {view === 'list' && (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div 
                  key={addr.id}
                  onClick={() => handleSelectAddress(addr)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${user.address?.id === addr.id ? 'bg-primary/5 border-primary/30' : 'bg-surface/30 border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-cream font-bold text-sm tracking-wide">{addr.fullName}</h4>
                      {user.address?.id === addr.id && (
                        <span className="bg-primary text-background text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                          <Check className="w-2 h-2" /> Selected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => handleEdit(e, addr)} className="p-2 text-cream/20 hover:text-primary transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => handleDelete(e, addr.id!)} className="p-2 text-cream/20 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-cream/50 text-[11px] leading-relaxed pr-8">
                    {addr.street}, {addr.city}<br/>
                    {addr.district}, {addr.state} - {addr.pincode}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-[10px] text-primary/60">
                    <span className="flex items-center gap-1 font-bold tracking-tight"><Phone className="w-2.5 h-2.5" /> {addr.phone}</span>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => { setFormData(initialFormState); setEditingAddressId(null); setView('choice'); }}
                className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-cream/40 text-xs font-bold uppercase tracking-[0.2em] hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            </div>
          )}

          {view === 'choice' && (
            <div className="space-y-4">
              <p className="text-cream/40 text-sm mb-6">Choose how you want to set your address</p>
              
              <button 
                onClick={handleAutoDetect}
                disabled={loading}
                className="w-full p-5 bg-surface/50 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-primary/50 transition-all text-left group"
              >
                <div className="p-3.5 bg-primary text-background rounded-xl group-hover:scale-110 transition-transform">
                  <Crosshair className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-cream font-bold text-sm mb-0.5">Use GPS / Map</h4>
                  <p className="text-cream/30 text-[10px]">Autodetect current location</p>
                </div>
                <ChevronRight className="w-5 h-5 text-cream/20" />
              </button>

              <button 
                onClick={() => setView('form')}
                className="w-full p-5 bg-surface/30 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-primary/50 transition-all text-left group"
              >
                <div className="p-3.5 bg-cream/10 text-cream rounded-xl group-hover:scale-110 transition-transform">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-cream font-bold text-sm mb-0.5">Manual Form</h4>
                  <p className="text-cream/30 text-[10px]">Type your address details</p>
                </div>
                <ChevronRight className="w-5 h-5 text-cream/20" />
              </button>
              
              {addresses.length > 0 && (
                <button 
                  onClick={() => setView('list')}
                  className="w-full text-center py-2 text-[10px] uppercase font-bold text-primary/60 tracking-widest mt-4"
                >
                  Back to my addresses
                </button>
              )}
            </div>
          )}

          {view === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4 pr-1">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-cream/40 font-bold ml-2">Personal</label>
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cream/20" />
                    <input 
                      required
                      type="text"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 bg-surface/50 border border-white/5 rounded-xl text-cream text-xs outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cream/20" />
                    <input 
                      required
                      type="tel"
                      placeholder="Mobile Number"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 bg-surface/50 border border-white/5 rounded-xl text-cream text-xs outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1 mt-4">
                <label className="text-[10px] uppercase tracking-widest text-cream/40 font-bold ml-2">Address</label>
                <div className="space-y-2.5">
                  <div className="relative">
                    <input 
                      required
                      type="text"
                      maxLength={6}
                      placeholder="Pincode"
                      value={formData.pincode}
                      onChange={handlePincodeChange}
                      className="w-full px-4 py-2.5 bg-surface/50 border border-white/5 rounded-xl text-cream text-xs outline-none focus:border-primary/50"
                    />
                    {pincodeLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <input 
                    required
                    type="text"
                    placeholder="Street / House No / Landmark"
                    value={formData.street}
                    onChange={e => setFormData({...formData, street: e.target.value})}
                    className="w-full px-4 py-2.5 bg-surface/50 border border-white/5 rounded-xl text-cream text-xs outline-none focus:border-primary/50"
                  />
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="relative">
                      <input 
                        required
                        type="text"
                        placeholder="City/Village"
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        className="w-full px-4 py-2.5 bg-surface/50 border border-white/5 rounded-xl text-cream text-xs outline-none focus:border-primary/50"
                      />
                      {citySuggestions.length > 1 && (
                        <div className="absolute bottom-full left-0 right-0 z-50 bg-surface border border-white/10 rounded-xl mb-1 max-h-40 overflow-y-auto shadow-2xl">
                          {citySuggestions.map((city, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, city }));
                                setCitySuggestions([]);
                              }}
                              className="w-full text-left px-3 py-2 text-[10px] text-cream/70 hover:bg-primary/10 hover:text-primary transition-colors border-b border-white/5 last:border-0"
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
                      className="w-full px-4 py-2.5 bg-surface/50 border border-white/5 rounded-xl text-cream text-xs outline-none focus:border-primary/50"
                    />
                  </div>
                  
                  <div className="relative">
                    <select 
                      required
                      value={formData.state}
                      onChange={e => setFormData({...formData, state: e.target.value})}
                      className="w-full px-4 py-2.5 bg-surface/50 border border-white/5 rounded-xl text-cream text-xs outline-none focus:border-primary/50 appearance-none"
                    >
                      <option value="" disabled className="bg-background">Select State</option>
                      {indianStates.map(state => (
                        <option key={state} value={state} className="bg-background">{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                 <button 
                  type="button"
                  onClick={() => setView(addresses.length > 0 ? 'list' : 'choice')}
                  className="flex-1 border border-white/10 text-cream/60 font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-primary text-background font-bold py-3 rounded-xl shadow-xl shadow-primary/20 disabled:opacity-50 text-[10px] uppercase tracking-[0.2em]"
                >
                  {loading ? 'Saving...' : editingAddressId ? 'Update' : 'Save Address'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
