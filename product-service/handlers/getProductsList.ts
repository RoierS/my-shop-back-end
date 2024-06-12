export const handler = async () => {
  try {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ 
        // TODO: products list
       }),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: error.message }),
    }
  }
}