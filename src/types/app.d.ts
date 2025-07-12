export interface UserData {
  id: number;
  name: string;
  email: string;
  cpf: string;
  createdAt?: string;
  updatedAt?: string;
  restores?: any[];
}

export interface CategoryData {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentData {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  admins?: any[];
}

export interface PostData {
  id: number;
  title: string;
  description: string;
  status: string;
  address: string;
  cep: string;
  neighborhood: string;
  publicId?: string;
  publicUrl?: string;
  latitude: string | null; 
  longitude: string | null;
  dateInit: string | null;
  dateEnd: string | null;
  comment: string | null;
  number?: number;
  categoryId: number;
  userId: number;
  departmentId: number;
  createdAt: string;
  updatedAt: string;
  category: CategoryData; 
  user: UserData;         
  department: DepartmentData;
}

export interface CommentData {
  id: number;
  text: string;
  userId: number;
  postId: number;
  createdAt: string;
  updatedAt: string;
  user: UserData;
}