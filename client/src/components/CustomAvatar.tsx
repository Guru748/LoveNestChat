import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Avatar options
const AVATAR_BASES = ['🐻', '🐼', '🐨', '🦊', '🐱', '🐶', '🐰', '🐭', '🦁', '🐯', '🐺', '🦄'];
const AVATAR_ACCESSORIES = ['', '👑', '🎀', '🎩', '🧢', '👓', '🕶️', '🪄', '🌟', '🌈', '💫', '✨'];
const AVATAR_COLORS = [
  'bg-pink-400', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 
  'bg-yellow-400', 'bg-lime-400', 'bg-green-400', 'bg-emerald-400',
  'bg-teal-400', 'bg-cyan-400', 'bg-blue-400', 'bg-indigo-400',
  'bg-violet-400', 'bg-purple-400', 'bg-fuchsia-400', 'bg-rose-400'
];

// Interface for the avatar data structure
export interface AvatarConfig {
  base: string;
  accessory: string;
  bgColor: string;
}

interface CustomAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  config: AvatarConfig;
  onChange?: (newConfig: AvatarConfig) => void;
  editable?: boolean;
  username?: string;
}

// Main component for displaying the avatar
export const CustomAvatar: React.FC<CustomAvatarProps> = ({
  size = 'md',
  config,
  onChange,
  editable = false,
  username,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<AvatarConfig>(config);
  
  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-base',
    md: 'w-10 h-10 text-xl',
    lg: 'w-16 h-16 text-3xl'
  };
  
  // Handle config changes
  const handleChange = (type: 'base' | 'accessory' | 'bgColor', value: string) => {
    const newConfig = {
      ...currentConfig,
      [type]: value
    };
    setCurrentConfig(newConfig);
  };
  
  // Save changes
  const saveChanges = () => {
    if (onChange) {
      onChange(currentConfig);
    }
    setIsDialogOpen(false);
  };
  
  // Render avatar display
  const renderAvatar = (cfg: AvatarConfig, clickable = true) => (
    <div
      className={`relative rounded-full flex items-center justify-center ${cfg.bgColor} ${sizeClasses[size]} ${
        clickable && editable ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      }`}
      onClick={clickable && editable ? () => setIsDialogOpen(true) : undefined}
      title={editable ? "Click to customize avatar" : username}
    >
      <div className="relative">
        <span>{cfg.base}</span>
        {cfg.accessory && (
          <span className="absolute top-[-10px] right-[-5px] transform scale-75">
            {cfg.accessory}
          </span>
        )}
      </div>
    </div>
  );
  
  return (
    <>
      {renderAvatar(config)}
      
      {editable && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-pink-600">Customize Your Avatar</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="base" className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="base">Base</TabsTrigger>
                <TabsTrigger value="accessory">Accessory</TabsTrigger>
                <TabsTrigger value="color">Color</TabsTrigger>
              </TabsList>
              
              <TabsContent value="base" className="mt-2">
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_BASES.map((base) => (
                    <Button
                      key={base}
                      variant="outline"
                      className={`p-2 h-12 ${
                        currentConfig.base === base ? 'border-2 border-pink-500' : ''
                      }`}
                      onClick={() => handleChange('base', base)}
                    >
                      <span className="text-xl">{base}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="accessory" className="mt-2">
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_ACCESSORIES.map((accessory, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`p-2 h-12 ${
                        currentConfig.accessory === accessory ? 'border-2 border-pink-500' : ''
                      }`}
                      onClick={() => handleChange('accessory', accessory)}
                    >
                      <span className="text-xl">{accessory || '🚫'}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="color" className="mt-2">
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`h-12 rounded-md ${color} ${
                        currentConfig.bgColor === color 
                          ? 'ring-2 ring-offset-2 ring-pink-500' 
                          : 'hover:ring-1 hover:ring-pink-300'
                      }`}
                      onClick={() => handleChange('bgColor', color)}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 flex justify-center">
              <div className="bg-pink-50 p-4 rounded-xl">
                <p className="text-center text-sm mb-2 text-pink-600">Preview</p>
                {renderAvatar(currentConfig, false)}
              </div>
            </div>
            
            <DialogFooter className="flex gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="outline" className="flex-1">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={saveChanges} 
                className="bg-pink-500 hover:bg-pink-600 flex-1"
              >
                Save Avatar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CustomAvatar;