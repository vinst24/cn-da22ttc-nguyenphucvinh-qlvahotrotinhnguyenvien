# TODO: Update addOrganizationAccount Function

## Task Description
Modify the `addOrganizationAccount` function in `backend/src/controllers/admin.controller.js` to accept all registration fields (fullName, email, phone, password, countryId, gender, dateOfBirth, address, bio) and link the account to the existing organization.

## Steps
- [x] Update the function to destructure all required fields from req.body
- [x] Update validation to check for required fields (fullName, email, password, countryId)
- [x] Pass all fields to the `register` function
- [x] Ensure the account is created with role "ORG" and linked via participation
- [x] Test the updated function
