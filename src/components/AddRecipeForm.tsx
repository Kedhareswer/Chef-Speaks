import React, { useState } from 'react';
import { Plus, X, Mic, MicOff } from 'lucide-react';
import { UserRecipe } from '../types';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface AddRecipeFormProps {
  onSubmit: (recipe: UserRecipe) => void;
  onCancel: () => void;
}

export const AddRecipeForm: React.FC<AddRecipeFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<UserRecipe>>({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    cookTime: 30,
    servings: 4,
    difficulty: 'Easy',
    cuisine: '',
    imageUrl: '',
    tags: [],
    author: '',
    status: 'draft'
  });

  const [currentTag, setCurrentTag] = useState('');
  const [voiceField, setVoiceField] = useState<string | null>(null);

  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceRecognition();
  const { speak } = useSpeechSynthesis();

  React.useEffect(() => {
    if (transcript && voiceField) {
      if (voiceField === 'title' || voiceField === 'description' || voiceField === 'cuisine' || voiceField === 'author') {
        setFormData(prev => ({ ...prev, [voiceField]: transcript }));
      } else if (voiceField.startsWith('ingredient-')) {
        const index = parseInt(voiceField.split('-')[1]);
        const newIngredients = [...(formData.ingredients || [])];
        newIngredients[index] = transcript;
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
      } else if (voiceField.startsWith('instruction-')) {
        const index = parseInt(voiceField.split('-')[1]);
        const newInstructions = [...(formData.instructions || [])];
        newInstructions[index] = transcript;
        setFormData(prev => ({ ...prev, instructions: newInstructions }));
      }
      setVoiceField(null);
    }
  }, [transcript, voiceField, formData.ingredients, formData.instructions]);

  const handleVoiceInput = (fieldName: string) => {
    if (isListening) {
      stopListening();
      setVoiceField(null);
    } else {
      setVoiceField(fieldName);
      startListening();
      speak(`Please speak the ${fieldName.replace('-', ' ')}`);
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), '']
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index) || []
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients[index] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...(prev.instructions || []), '']
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions?.filter((_, i) => i !== index) || []
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...(formData.instructions || [])];
    newInstructions[index] = value;
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.author) {
      speak('Please fill in all required fields: title, description, and author name.');
      return;
    }

    if (!formData.ingredients?.some(ing => ing.trim()) || !formData.instructions?.some(inst => inst.trim())) {
      speak('Please add at least one ingredient and one instruction.');
      return;
    }

    const recipe: UserRecipe = {
      ...formData,
      ingredients: formData.ingredients?.filter(ing => ing.trim()) || [],
      instructions: formData.instructions?.filter(inst => inst.trim()) || [],
      tags: formData.tags || [],
      imageUrl: formData.imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      status: 'submitted'
    } as UserRecipe;

    onSubmit(recipe);
    speak(`Thank you ${formData.author}! Your recipe "${formData.title}" has been submitted for review.`);
  };

  const VoiceButton: React.FC<{ fieldName: string; className?: string }> = ({ fieldName, className = "" }) => (
    isSupported && (
      <button
        type="button"
        onClick={() => handleVoiceInput(fieldName)}
        className={`p-2 rounded-3xl transition-colors ${
          voiceField === fieldName && isListening
            ? 'bg-terracotta-100 text-terracotta-600'
            : 'bg-soft-brown-100 text-soft-brown-600 hover:bg-soft-brown-200'
        } ${className}`}
        title="Voice input"
      >
        {voiceField === fieldName && isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
    )
  );

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-soft-brown-700 mb-2">
            Recipe Title *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="flex-1 px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-light-lavender-500"
              required
            />
            <VoiceButton fieldName="title" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-soft-brown-700 mb-2">
            Your Name *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.author || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="flex-1 px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-light-lavender-500"
              required
            />
            <VoiceButton fieldName="author" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-soft-brown-700 mb-2">
          Description *
        </label>
        <div className="flex gap-2">
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="flex-1 px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-light-lavender-500 h-24 resize-none"
            required
          />
          <VoiceButton fieldName="description" />
        </div>
      </div>

      {/* Recipe Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-soft-brown-700 mb-2">
            Cook Time (minutes)
          </label>
          <input
            type="number"
            value={formData.cookTime || 30}
            onChange={(e) => setFormData(prev => ({ ...prev, cookTime: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-light-lavender-500"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-soft-brown-700 mb-2">
            Servings
          </label>
          <input
            type="number"
            value={formData.servings || 4}
            onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-light-lavender-500"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-soft-brown-700 mb-2">
            Difficulty
          </label>
          <select
            value={formData.difficulty || 'Easy'}
            onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' }))}
            className="w-full px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-light-lavender-500"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-soft-brown-700 mb-2">
            Cuisine
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.cuisine || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, cuisine: e.target.value }))}
              className="flex-1 px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-light-lavender-500"
            />
            <VoiceButton fieldName="cuisine" />
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className="block text-sm font-medium text-soft-brown-700 mb-2">
          Ingredients *
        </label>
        <div className="space-y-2">
          {formData.ingredients?.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
                className="flex-1 px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-light-lavender-500"
              />
              <VoiceButton fieldName={`ingredient-${index}`} />
              {formData.ingredients!.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="p-2 text-terracotta-500 hover:bg-terracotta-50 rounded-3xl"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="flex items-center gap-2 text-light-lavender-600 hover:text-light-lavender-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Ingredient
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-soft-brown-700 mb-2">
          Instructions *
        </label>
        <div className="space-y-2">
          {formData.instructions?.map((instruction, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-8 bg-light-lavender-100 text-light-lavender-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                {index + 1}
              </div>
              <textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                className="flex-1 px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-light-lavender-500 h-20 resize-none"
              />
              <VoiceButton fieldName={`instruction-${index}`} />
              {formData.instructions!.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="p-2 text-terracotta-500 hover:bg-terracotta-50 rounded-3xl"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="flex items-center gap-2 text-light-lavender-600 hover:text-light-lavender-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Step
          </button>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-soft-brown-700 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add a tag"
            className="flex-1 px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-light-lavender-500"
          />
          <button
            type="button"
            onClick={addTag}
            className="bg-light-lavender-100 text-light-lavender-600 px-4 py-2 rounded-3xl hover:bg-light-lavender-200 transition-colors"
          >
            Add
          </button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="bg-light-lavender-100 text-light-lavender-800 px-3 py-1 rounded-pill text-sm font-medium flex items-center gap-2"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:bg-light-lavender-200 rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-soft-brown-700 mb-2">
          Image URL (optional)
        </label>
        <input
          type="url"
          value={formData.imageUrl || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-light-lavender-500"
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-4 border-t border-soft-brown-200">
        <button
          type="submit"
          className="flex-1 btn-organic btn-organic-secondary"
        >
          Submit Recipe
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-organic btn-organic-soft"
        >
          Cancel
        </button>
      </div>

      {/* Voice Status */}
      {isListening && (
        <div className="fixed bottom-6 right-6 glass-organic text-soft-brown-900 px-4 py-2 rounded-3xl shadow-soft-lg">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1 h-4 organic-wave"></div>
              <div className="w-1 h-3 organic-wave"></div>
              <div className="w-1 h-5 organic-wave"></div>
            </div>
            <span className="text-sm">Listening...</span>
          </div>
        </div>
      )}
    </form>
  );
};