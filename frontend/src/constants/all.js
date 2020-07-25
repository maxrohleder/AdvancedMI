// https://medium.com/@austinpaley32/how-to-add-a-constants-file-to-your-react-project-6ce31c015774
export const PRODUCTION = !true;
export let API_URL;

// EditAdminInfo
export const SALT = 10;
export const REGISTER_PLACE = "registerPraxis/";

// registerAdmin
export const VERIFY_EMAIL_ROUTE = "auth-email/";

if (PRODUCTION) {
  API_URL = "https://wartezimmer-a2415.nw.r.appspot.com:8080/";
} else {
  API_URL = "http://0.0.0.0:8080/";
}