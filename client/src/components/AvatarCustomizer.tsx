import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type AvatarConfig } from './CustomAvatar';

// Avatar options
const AVATAR_BASES = ['🐻', '🐼', '🐨', '🦊', '🐱', '🐶', '🐰', '🐭', '🦁', '🐯', '🐺', '🦄', '🐸', '🐹', '🐮', '🐔'];
const AVATAR_ACCESSORIES = ['', '👑', '🎀', '🎩', '🧢', '👓', '🕶️', '🧣', '🦺', '🪄', '🌟', '🌈', '💫', '✨', '💕', '💖'];
const AVATAR_COLORS = [
  'bg-pink-400', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 
  'bg-yellow-400', 'bg-lime-400', 'bg-green-400', 'bg-emerald-400',
  'bg-teal-400', 'bg-cyan-400', 'bg-blue-400', 'bg-indigo-400',
  'bg-violet-400', 'bg-purple-400', 'bg-fuchsia-400', 'bg-rose-400'
];

interface AvatarCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  title?: string;
}

const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  isOpen,
  onClose,
  initialConfig,
  onSave,
  title = "Customize Your Avatar"
}) => {
  const [currentConfig, setCurrentConfig] = useState<AvatarConfig>(initialConfig);
  
  // Reset to initial config when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentConfig(initialConfig);
    }
  }, [isOpen, initialConfig]);
  
  // Handle config changes
  const handleChange = (type: keyof AvatarConfig, value: string) => {
    setCurrentConfig(prev => ({
      ...prev,
      [type]: value
    }));
  };
  
  // Save changes
  const handleSave = () => {
    onSave(currentConfig);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-pink-600">{title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="base" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="base">Character</TabsTrigger>
            <TabsTrigger value="accessory">Accessory</TabsTrigger>
            <TabsTrigger value="color">Background</TabsTrigger>
          </TabsList>
          
          <TabsContent value="base" className="mt-4">
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_BASES.map((base) => (
                <button
                  key={base}
                  className={`h-14 rounded-md flex items-center justify-center text-2xl ${
                    currentConfig.base === base 
                      ? 'bg-pink-100 ring-2 ring-pink-500' 
                      : 'bg-gray-50 hover:bg-pink-50'
                  }`}
                  onClick={() => handleChange('base', base)}
                >
                  {base}
                </button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="accessory" className="mt-4">
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_ACCESSORIES.map((accessory, index) => (
                <button
                  key={index}
                  className={`h-14 rounded-md flex items-center justify-center text-2xl ${
                    currentConfig.accessory === accessory 
                      ? 'bg-pink-100 ring-2 ring-pink-500' 
                      : 'bg-gray-50 hover:bg-pink-50'
                  }`}
                  onClick={() => handleChange('accessory', accessory)}
                >
                  {accessory || '❌'}
                </button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="color" className="mt-4">
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  className={`h-14 rounded-md ${color} ${
                    currentConfig.bgColor === color 
                      ? 'ring-2 ring-offset-2 ring-pink-500' 
                      : 'hover:opacity-90'
                  }`}
                  onClick={() => handleChange('bgColor', color)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-center">
          <div className="bg-gray-50 p-6 rounded-xl border border-pink-100">
            <p className="text-center text-sm mb-3 text-pink-600">Preview</p>
            <div className={`w-20 h-20 ${currentConfig.bgColor} rounded-full flex items-center justify-center relative mx-auto`}>
              <span className="text-4xl">{currentConfig.base}</span>
              {currentConfig.accessory && (
                <span className="absolute top-[-10px] right-[-5px] transform scale-[0.85]">
                  {currentConfig.accessory}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-pink-500 hover:bg-pink-600 flex-1"
          >
            Save Avatar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarCustomizer;