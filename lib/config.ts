// Environment Variables - Hardcoded Configuration
// Agar kuch change karna ho to yahan se karein

export const config = {
  // MongoDB Configuration
  // Password me @ character ko URL encode karna padta hai: @ = %40
  MONGODB_URI: "mongodb+srv://websevix:%40websevix541600@bhanu.ur1ftos.mongodb.net/?appName=bhanu",
  
  // NextAuth Configuration
  NEXTAUTH_URL: "https://websevix.com",
  NEXTAUTH_SECRET: "websevixofficial!!@@##$$%%^^%%$$#!!",
  
  // Razorpay Configuration
  RAZORPAY_KEY_ID: "your-razorpay-key",
  RAZORPAY_KEY_SECRET: "your-razorpay-secret",
  
  // Email Configuration
  EMAIL_HOST: "mail.websevix.com",
  EMAIL_PORT: 465,
  EMAIL_USER: "login@websevix.com",
  EMAIL_PASSWORD: "*}ar-0_]L[e9D^o_",
  EMAIL_FROM: "WebSevix <no-reply@websevix.com>",
  
  // OpenAI Configuration (agar use ho raha ho)
  OPENAI_API_KEY: "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",
  
  // Socket Secret (agar use ho raha ho)
  SOCKET_SECRET: "b7F9xL2sV4kP8qR1mT6zW3cY5nH8uJ2dQ9aE6tB1vC4rK7yM3pS8wZ5",
} as const;
