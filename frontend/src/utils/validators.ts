import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(1, 'Password is required').required(),
})

export const registerSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'At least 8 characters')
    .matches(/[A-Z]/, 'At least one uppercase letter')
    .matches(/[0-9]/, 'At least one number')
    .required('Password is required'),
  first_name: yup.string().min(1).max(100).required('First name is required'),
  last_name: yup.string().min(1).max(100).required('Last name is required'),
})

export const projectSchema = yup.object({
  title: yup.string().min(3, 'At least 3 characters').max(200).required('Title is required'),
  description: yup.string().max(2000).optional(),
  status: yup.string().oneOf(['active', 'completed']).optional(),
  deadline: yup.string().optional(),
})

export const taskSchema = yup.object({
  title: yup.string().min(3).max(200).required('Title is required'),
  description: yup.string().optional(),
  status: yup.string().oneOf(['todo', 'in-progress', 'done']).optional(),
  priority: yup.string().oneOf(['low', 'medium', 'high']).optional(),
  due_date: yup.string().optional(),
  assigned_to: yup.string().uuid().optional(),
})
