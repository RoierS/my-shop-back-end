export const validateProductData = (data: any) => {
  const { title, description, price, count } = data;

  if (!title || typeof title !== 'string' || title === '') {
    throw new Error('Title is required and must be a string');
  }

  if (!description || typeof description !== 'string' || description === '') {
    throw new Error('Description is required and must be a string');
  }

  if (!Number.isInteger(price) || price <= 0 || !price || typeof price !== 'number') {
    throw new Error('Price is required and must be a positive integer');
  }

  if (count !== undefined && (!Number.isInteger(count) || count < 0)) {
    throw new Error('Count must be a non-negative integer');
  }
};