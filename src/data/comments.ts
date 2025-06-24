import { Comment } from '../types';

export const sampleComments: Comment[] = [
  {
    id: '1',
    recipeId: '1',
    author: 'Maria Rodriguez',
    content: 'This carbonara recipe is absolutely perfect! The technique for the egg mixture is spot on. I added a bit more black pepper and it was divine.',
    rating: 5,
    createdAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: '2',
    recipeId: '1',
    author: 'Chef Antonio',
    content: 'As an Italian chef, I approve! One tip: save more pasta water than you think you need. It really helps with the creamy consistency.',
    rating: 5,
    createdAt: new Date('2024-01-16T14:20:00Z')
  },
  {
    id: '3',
    recipeId: '2',
    author: 'Priya Sharma',
    content: 'Loved this tikka masala! I used coconut milk instead of heavy cream for a lighter version. Still incredibly flavorful.',
    rating: 4,
    createdAt: new Date('2024-01-17T18:45:00Z')
  },
  {
    id: '4',
    recipeId: '2',
    author: 'David Kim',
    content: 'The spice blend is perfect. I marinated the chicken overnight and it was even better. Will definitely make again!',
    rating: 5,
    createdAt: new Date('2024-01-18T12:15:00Z'),
    isVoiceComment: true
  },
  {
    id: '5',
    recipeId: '3',
    author: 'Sophie Laurent',
    content: 'These croissants took me three attempts but they were worth it! The lamination technique video really helped.',
    rating: 4,
    createdAt: new Date('2024-01-19T08:30:00Z')
  }
];

export const getCommentsByRecipeId = (recipeId: string): Comment[] => {
  return sampleComments.filter(comment => comment.recipeId === recipeId);
};

export const addComment = (comment: Omit<Comment, 'id' | 'createdAt'>): Comment => {
  const newComment: Comment = {
    ...comment,
    id: Date.now().toString(),
    createdAt: new Date()
  };
  sampleComments.push(newComment);
  return newComment;
};