'use client';

import { useState } from 'react';
import {
  Upload,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Car,
  Bike,
  Plus,
  Trash2,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type VehicleFormData = {
  title: string;
  type: 'car' | 'bike';
  pricePerHour: string;
  pricePerDay: string;
  location: {
    address: string;
    lat: string;
    lng: string;
  };
  images: File[];
  availableRanges: {
    from: string;
    to: string;
  }[];
  description: string;
};

const steps = [
  { id: 1, name: 'Basic Info', icon: Car },
  { id: 2, name: 'Pricing', icon: DollarSign },
  { id: 3, name: 'Location', icon: MapPin },
  { id: 4, name: 'Images', icon: Upload },
  { id: 5, name: 'Availability', icon: Calendar },
  { id: 6, name: 'Description', icon: FileText },
];

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (data: VehicleFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddVehicleModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddVehicleModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    title: '',
    type: 'car',
    pricePerHour: '',
    pricePerDay: '',
    location: {
      address: '',
      lat: '',
      lng: '',
    },
    images: [],
    availableRanges: [{ from: '', to: '' }],
    description: '',
  });

  const updateField = (field: keyof VehicleFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateLocation = (
    field: keyof VehicleFormData['location'],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  const addAvailabilityRange = () => {
    setFormData((prev) => ({
      ...prev,
      availableRanges: [...prev.availableRanges, { from: '', to: '' }],
    }));
  };

  const removeAvailabilityRange = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      availableRanges: prev.availableRanges.filter((_, i) => i !== index),
    }));
  };

  const updateAvailabilityRange = (
    index: number,
    field: 'from' | 'to',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      availableRanges: prev.availableRanges.map((range, i) =>
        i === index ? { ...range, [field]: value } : range
      ),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.title.trim().length > 0;
      case 2:
        return (
          formData.pricePerHour.trim().length > 0 &&
          parseFloat(formData.pricePerHour) > 0 &&
          formData.pricePerDay.trim().length > 0 &&
          parseFloat(formData.pricePerDay) > 0
        );
      case 3:
        return formData.location.address.trim().length > 0;
      case 4:
        return formData.images.length > 0;
      case 5:
        return formData.availableRanges.some((range) => range.from && range.to);
      case 6:
        return formData.description.trim().length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(steps.length, currentStep + 1));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const isProcessing = isLoading || isSubmitting;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">
                Vehicle Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Toyota Prius 2019"
                className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary outline-none transition-colors"
              />
              {formData.title.trim().length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Vehicle title is required
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">
                Vehicle Type <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => updateField('type', 'car')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.type === 'car'
                      ? 'border-primary bg-primary/10'
                      : 'border-input hover:border-muted-foreground'
                  }`}
                >
                  <Car
                    className={`w-8 h-8 mx-auto mb-2 ${formData.type === 'car' ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                  <span className="font-semibold">Car</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('type', 'bike')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.type === 'bike'
                      ? 'border-primary bg-primary/10'
                      : 'border-input hover:border-muted-foreground'
                  }`}
                >
                  <Bike
                    className={`w-8 h-8 mx-auto mb-2 ${formData.type === 'bike' ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                  <span className="font-semibold">Bike</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">
                Price Per Hour (LKR) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <p className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground">
                  LKR
                </p>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.pricePerHour}
                  onChange={(e) => updateField('pricePerHour', e.target.value)}
                  placeholder="6.5"
                  className="ml-4 w-full pl-10 pr-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary outline-none transition-colors"
                />
              </div>
              {(!formData.pricePerHour ||
                parseFloat(formData.pricePerHour) <= 0) && (
                <p className="text-xs text-muted-foreground mt-1">
                  Please enter a valid hourly price
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">
                Price Per Day (LKR) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <p className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground">
                  LKR
                </p>{' '}
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.pricePerDay}
                  onChange={(e) => updateField('pricePerDay', e.target.value)}
                  placeholder="45"
                  className="ml-4 w-full pl-10 pr-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary outline-none transition-colors"
                />
              </div>
              {(!formData.pricePerDay ||
                parseFloat(formData.pricePerDay) <= 0) && (
                <p className="text-xs text-muted-foreground mt-1">
                  Please enter a valid daily price
                </p>
              )}
            </div>

            {formData.pricePerHour &&
              formData.pricePerDay &&
              parseFloat(formData.pricePerHour) > 0 &&
              parseFloat(formData.pricePerDay) > 0 && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm">
                    <span className="font-semibold">Daily rate savings:</span>{' '}
                    LKR
                    {(
                      parseFloat(formData.pricePerHour) * 24 -
                      parseFloat(formData.pricePerDay)
                    ).toFixed(2)}{' '}
                    (
                    {(
                      ((parseFloat(formData.pricePerHour) * 24 -
                        parseFloat(formData.pricePerDay)) /
                        (parseFloat(formData.pricePerHour) * 24)) *
                      100
                    ).toFixed(0)}
                    % off)
                  </p>
                </div>
              )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">
                Address <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <textarea
                  value={formData.location.address}
                  onChange={(e) => updateLocation('address', e.target.value)}
                  placeholder="e.g., Colombo 7, Sri Lanka"
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary outline-none transition-colors resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-3">
                  Latitude <span className="text-destructive"></span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.location.lat}
                  onChange={(e) => updateLocation('lat', e.target.value)}
                  placeholder="6.9149"
                  className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">
                  Longitude <span className="text-destructive"></span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.location.lng}
                  onChange={(e) => updateLocation('lng', e.target.value)}
                  placeholder="79.8615"
                  className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            {!formData.location.address && (
              <p className="text-xs text-muted-foreground">
                address field is required
              </p>
            )}

            <div className="p-4 rounded-lg bg-muted border border-border">
              <p className="text-sm text-muted-foreground">
                💡 Tip: You can use Google Maps to find exact coordinates.
                Right-click on a location and copy the coordinates.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">
                Vehicle Images <span className="text-destructive">*</span>
              </label>

              {/* Upload Button */}
              <div className="mb-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-input hover:border-primary rounded-lg p-8 text-center transition-colors hover:bg-primary/5">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-semibold mb-1">Click to upload images</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, WEBP up to 2MB each
                    </p>
                  </div>
                </label>
              </div>

              {/* Image Thumbnails */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.images.map((img, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border"
                    >
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Vehicle ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Please upload at least one image
                </p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">
                Availability Periods <span className="text-destructive">*</span>
              </label>
              <div className="space-y-4">
                {formData.availableRanges.map((range, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border-2 border-border bg-muted/50 space-y-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">
                        Period {index + 1}
                      </span>
                      {formData.availableRanges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAvailabilityRange(index)}
                          className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-muted-foreground">
                          From
                        </label>
                        <input
                          type="datetime-local"
                          value={range.from}
                          onChange={(e) =>
                            updateAvailabilityRange(
                              index,
                              'from',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:border-primary outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1 text-muted-foreground">
                          To
                        </label>
                        <input
                          type="datetime-local"
                          value={range.to}
                          onChange={(e) =>
                            updateAvailabilityRange(index, 'to', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:border-primary outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!formData.availableRanges.some(
                (range) => range.from && range.to
              ) && (
                <p className="text-xs text-muted-foreground">
                  Please add at least one availability period
                </p>
              )}

              <button
                type="button"
                onClick={addAvailabilityRange}
                className="w-full mt-3 px-4 py-3 rounded-lg border-2 border-dashed border-muted-foreground/50 hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Another Period
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">
                Vehicle Description <span className="text-destructive">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your vehicle, its features, condition, and any special notes for renters..."
                rows={8}
                className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary outline-none transition-colors resize-none"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {formData.description.length} characters
              </p>
              {formData.description.trim().length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Description is required
                </p>
              )}
            </div>

            <div className="p-6 rounded-lg bg-primary/10 border border-primary/20">
              <h3 className="font-semibold text-lg mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle:</span>
                  <span className="font-semibold">
                    {formData.title || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-semibold capitalize">
                    {formData.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pricing:</span>
                  <span className="font-semibold">
                    ${formData.pricePerHour || '0'}/hr · LKR
                    {formData.pricePerDay || '0'}/day
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Images:</span>
                  <span className="font-semibold">
                    {formData.images.length} uploaded
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Availability:</span>
                  <span className="font-semibold">
                    {
                      formData.availableRanges.filter((r) => r.from && r.to)
                        .length
                    }{' '}
                    period(s)
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = validateStep(currentStep);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                Add New Vehicle
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Step {currentStep} of {steps.length}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    disabled={step.id > currentStep}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : isCompleted
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="text-sm hidden sm:inline">
                      {step.name}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">{renderStepContent()}</div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2.5 rounded-lg font-semibold border-2 border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>

            {currentStep === steps.length ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed}
                className="px-8 py-2.5 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Vehicle
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="px-6 py-2.5 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
