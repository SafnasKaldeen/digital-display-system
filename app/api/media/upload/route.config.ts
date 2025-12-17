// app/api/media/upload/route.config.ts
export const config = {
  api: {
    bodyParser: false, // Disable default body parser
    responseLimit: false,
  },
};