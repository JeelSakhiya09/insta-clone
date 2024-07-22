import bcrypt from "bcrypt";

export async function passwordHasing(password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword
}

export async function matchPassword(password, hashedPassword) {
    const isValidPassword = await bcrypt.compare(password, hashedPassword);
    return isValidPassword;
}