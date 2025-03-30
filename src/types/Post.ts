// types/Post.ts

export interface PostComment {
  userId: string;
  text: string;
  createdAt: string;
}

export interface PostClient {
  id: string;
  userId: string;
  content: string;
  image?: string;
  createdAt: string;
  likes: string[];
  comments: PostComment[];
}
