export const generateOtp = (length: number = 4): string => {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10); // Adds a digit from 0–9
    }
    return otp;
};

