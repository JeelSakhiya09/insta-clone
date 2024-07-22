export function generateOtp() {
    return Math.floor(Math.random()*(9999-1111) + 1111);
}