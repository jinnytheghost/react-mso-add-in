import * as sjcl from 'sjcl';

export function validateEmail(email) {
    const regExp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    const emailTested = regExp.test(String(email).toLowerCase());
    return emailTested;
}

export function validatePassword(password) {
    const regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    const passwordTested = regExp.test(String(password));
    return passwordTested;
}

export function isEmpty(InputString: any): boolean {
    return InputString.trim() === '';
}

export function getEmailHash(email: string) {
    const bitArray = sjcl.hash.sha256.hash(email);
    return sjcl.codec.base64.fromBits(bitArray);
}
