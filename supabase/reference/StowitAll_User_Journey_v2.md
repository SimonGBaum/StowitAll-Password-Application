# StowitAll

*One vault. Every password. Zero excuses.*

**User Journey & Interaction Reference**

Version 2.0

---

## Overview

This document describes every path a user can take through StowitAll — from first landing on the application to logging out. It covers the happy path for each workflow, all meaningful error and edge-case branches, and the navigation options available on each page.

StowitAll is a single-page application (SPA) with seven distinct page states: Login/Sign-Up, Home, Password Creation Room, The Vault, Profile, Contact Us, and Error. Three of these transitions are accompanied by the Smoky Veil full-screen animation: Login, Logout, and successful password generation.

Pages are grouped below by the user's position in their session — pre-authentication, authenticated core, and system edge cases.

---

## 1. Pre-Authentication: Login & Sign-Up

The Login and Sign-Up views share a single page component. The user's authentication state and whether they have an existing account determine which state is shown. Neither view is accessible after a successful login — navigating back takes the user to Home.

### 1.1 First-Time Visitor — Sign-Up Flow

#### Entry

- User arrives at the application for the first time.
- The Sign-Up state is shown by default on a first visit (no session cookie exists).

#### Sign-Up Form Completion

- User fills in all six required fields:
  - Email address
  - First name
  - Last name
  - Username
  - Password
  - Confirm password
- User clicks Submit.

#### Happy Path

- All fields are valid and the two password fields match.
- Account is created. The page transitions directly to the Login state — the user is prompted to sign in with their new credentials.

#### Error Branches — Sign-Up

- **Password mismatch:** inline validation error appears beneath the Confirm Password field. Form does not submit. User corrects the field and resubmits.
- **Email already registered:** error message informs the user that an account with that email exists. The state-toggle link ("I have an account") is highlighted as the suggested next action.
- **Blank required field:** the blank field is highlighted. Form does not submit until all fields are filled.

#### Already Have an Account?

- User clicks "I have an account" at the bottom-left of the form card.
- The component switches to the Login state. No page reload.

---

### 1.2 Returning Visitor — Login Flow

#### Entry

- Returning user arrives at the application.
- A valid session cookie is absent — the Login state is shown.

#### Login Form Completion

- User enters their email address.
- User enters their password.
- User clicks Submit.

#### Happy Path

- Credentials are valid.
- The Smoky Veil transition fires (full-screen forge-smoke animation, ~300ms).
- The Home Page appears as the smoke clears.

#### Error Branches — Login

- **Incorrect email or password:** an error message is displayed within the form card. Neither field reveals which specific value is wrong (security best practice). User re-enters credentials and resubmits.
- **Blank email field:** field is highlighted, form does not submit.
- **Blank password field:** field is highlighted, form does not submit.

#### Don't Have an Account?

- User clicks "I do not have an account" at the bottom-left of the form card.
- The component switches to the Sign-Up state. No page reload.

---

## 2. Home Page

The Home Page is the central hub of the application. All primary destinations are reachable from here. It is also the destination the user returns to after navigating away from any other authenticated page.

### 2.1 What the User Sees

- **Header bar** (persistent across all authenticated pages):
  - "User Profile" link — top-left. Navigates to the Profile Page.
  - StowitAll wordmark — center.
  - Date-Time Group — top-right. Live timestamp, display only.
- Hero block: large StowitAll logo and slogan ("One vault. Every password. Zero excuses.").
- A short quatrain in the brand voice describing what StowitAll does for the user.
- Primary CTA: "Password Creation Room" — large, full-width button.
- Secondary navigation row at the bottom:
  - "Contact Us" — bottom-left.
  - "My Vault" — bottom-center.
  - "Log Out" — bottom-right.

### 2.2 Navigation Paths from Home

- Click "User Profile" (top-left header) → Profile Page.
- Click "Password Creation Room" (main CTA) → Password Creation Room.
- Click "My Vault" (bottom-center) → The Vault.
- Click "Contact Us" (bottom-left) → Contact Us Page.
- Click "Log Out" (bottom-right) → Smoky Veil fires → returns to Login state. Session is ended.

---

## 3. Password Creation Room

The Password Creation Room is where users create, search, edit, and delete their stored passwords. It also houses The Grand Crucible — the password generation widget. This page is the primary workspace of the application.

### 3.1 What the User Sees

- Header bar: StowitAll wordmark (left) | Date-Time Group (top-right).
- Page title: "The Password Creation Room."
- Action button row: "New" | "Edit" | "Delete."
- Search/filter fields: "Password Name" | "Company Name."
- The Grand Crucible widget (see §3.3).
- Footer navigation: "Contact Us" (left) | "Home" (center) | "Log Out" (right).

### 3.2 Password Record Actions

#### Creating a New Password Record

- User clicks "New."
- The Password Name and Company Name input fields become active and ready for input.
- User enters a Password Name (e.g., "Netflix") and a Company Name (e.g., "Netflix, Inc.").
- User optionally uses The Grand Crucible to generate a password (see §3.3).
- User saves the record. The new entry is added to the password store.

#### Searching for a Password Record

- User types into the "Password Name" field to filter records by name.
- User types into the "Company Name" field to filter records by company.
- Results update as the user types. If no records match, the results area shows an empty state message in the brand voice.

#### Editing a Password Record

- User locates the target record (via search or scroll).
- User selects the record to highlight it.
- User clicks "Edit." The record's fields become editable.
- User makes changes and saves.
- **Edge case:** User clicks "Edit" without a record selected — no action occurs. A brief inline prompt reminds the user to select a record first.

#### Deleting a Password Record

- User locates and selects the target record.
- User clicks "Delete."
- A confirmation prompt appears asking the user to confirm the deletion. This is a destructive, irreversible action.
- User confirms → record is permanently removed.
- User cancels → record is unchanged. Returns to default state.
- **Edge case:** User clicks "Delete" without a record selected — no action occurs. A brief inline prompt reminds the user to select a record first.

### 3.3 The Grand Crucible — Password Generation

The Grand Crucible is the password generation widget within the Password Creation Room. Parameter inputs are called "Components." The generation action is called "Forge."

#### The Forge Workflow

- User sets their Components: desired password length, character types to include (uppercase, lowercase, numbers, symbols), and any other available parameters.
- User clicks "Forge."
- The Swirl Sequence activates (~400ms): alphanumeric characters flash and spin inside a green smoky SVG vortex within the output field.
- The smoke clears. The final generated password drops into steady alignment in the output field.
- The Smoky Veil full-screen transition fires, marking the completion of the forge event.
- The user can copy the generated password to use it in the new record, or click "Forge" again to generate a different one.

> ℹ️ Pressing Escape or clicking outside the Crucible during the Swirl Sequence completes the animation instantly and displays the last computed credential.

### 3.4 Navigation Paths from Password Creation Room

- Click "Home" (footer center) → Home Page.
- Click "Contact Us" (footer left) → Contact Us Page.
- Click "Log Out" (footer right) → Smoky Veil fires → Login state. Session ended.

---

## 4. The Vault

The Vault is the user's master view of all stored password records. It is a read, search, edit, and delete interface — new passwords are created in the Password Creation Room, not here.

### 4.1 What the User Sees

- Header bar: "Home" link (top-left) | StowitAll wordmark (center) | Date-Time Group (top-right).
- Page title: "The Vault" in large display type.
- Column headers for the records table: "Password" | "Site Name" | "Date Created."
- Action button row: "Search" | "Edit" | "Delete."
- Password record rows displayed beneath the headers.
- Vault door status icon — glows green when the vault is open/accessible.

> ℹ️ The Vault has no footer navigation bar. The only persistent exit is the "Home" link in the header. This is intentional — it keeps the focus on the vault contents.

### 4.2 Searching the Vault

- User clicks "Search."
- Search inputs become active. The user can filter records by:
  - Password name
  - Site name
  - Date created
- Results filter in real time as the user types.
- If no records match the search criteria, the records area displays an empty state message.
- If the vault contains no records at all, the page displays an empty state prompt encouraging the user to visit the Password Creation Room to forge their first credential.

### 4.3 Editing a Vault Record

- User locates the target record.
- User selects the record to highlight it.
- User clicks "Edit." The record's fields become editable inline.
- User makes changes and saves.
- **Edge case:** User clicks "Edit" with no record selected — no action occurs. A brief inline prompt reminds the user to select a record first.

### 4.4 Deleting a Vault Record

- User selects the target record.
- User clicks "Delete."
- A confirmation prompt appears. Deletion is permanent and irreversible.
- User confirms → record is removed.
- User cancels → record is unchanged.
- **Edge case:** User clicks "Delete" with no record selected — no action occurs. A brief inline prompt reminds the user to select a record first.

### 4.5 Navigation Paths from The Vault

- Click "Home" (header top-left) → Home Page.

> ⚠️ There is no direct path from The Vault to the Password Creation Room, Profile, or Contact Us. The user must return to Home first.

---

## 5. Profile Page

The Profile Page displays the user's account information. Fields are read-only by default and must be explicitly unlocked before they can be edited.

### 5.1 What the User Sees

- Header: StowitAll wordmark (center) | Date-Time Group (top-right).
- Five read-only display fields: First Name | Last Name | Username | Email | Password (masked).
- "Save" and "Edit" buttons. "Save" is inactive until "Edit" is clicked.
- Footer navigation: "Contact Us" (left) | "Home" (center) | "Log Out" (right).

### 5.2 Viewing Profile Information

- User arrives on the Profile Page from the "User Profile" link on the Home Page header.
- All fields display current account data in read-only mode. The Password field is masked (e.g., ••••••••).
- No editing is possible in this state.

### 5.3 Editing Profile Information

- User clicks "Edit." All five fields become editable. "Save" becomes active.
- User modifies one or more fields.
- User clicks "Save." Changes are persisted. Fields return to read-only mode. "Save" becomes inactive again.
- **Edge case — Password change:** If the user edits the Password field, a "Confirm Password" field should appear to validate the new value before saving.
- **Edge case — Cancel without saving:** If the user clicks "Home" or "Log Out" after clicking "Edit" but before clicking "Save," a confirmation prompt should warn that unsaved changes will be lost.

### 5.4 Navigation Paths from Profile

- Click "Home" (footer center) → Home Page.
- Click "Contact Us" (footer left) → Contact Us Page.
- Click "Log Out" (footer right) → Smoky Veil fires → Login state. Session ended.

> ⚠️ There is no direct path from the Profile Page to the Password Creation Room or The Vault. The user must return to Home first.

---

## 6. Contact Us Page

The Contact Us Page is a simple, read-only information page. There are no forms to submit and no interactive inputs. Its sole purpose is to provide the user with ways to reach the team behind StowitAll.

### 6.1 What the User Sees

- Header: Username (top-left) | StowitAll wordmark (center) | Date-Time Group (top-right).
- A "Home" shortcut button centered below the header — the primary exit from this page.
- A short, welcoming intro message in the brand voice.
- Four contact entries, each as a labeled link:
  - Email
  - Phone
  - GitHub
  - LinkedIn

> ℹ️ All four contact values are clickable: email opens the user's mail client, phone initiates a call on supported devices, GitHub and LinkedIn open in a new browser tab.

### 6.2 Navigation Paths from Contact Us

- Click "Home" (button below header) → Home Page. This is the primary and recommended exit.

> ℹ️ Contact Us is reachable from Home, the Password Creation Room, and the Profile Page. In all three cases, the exit leads back to Home — not back to the originating page.

---

## 7. Error Page

The Error Page appears when the application encounters an unhandled error or an unexpected system state. It is intentionally theatrical in keeping with the StowitAll brand, but always concludes with a sincere apology and a clear exit.

### 7.1 What Triggers the Error Page

- An unhandled application exception or server error.
- An invalid or expired session that cannot be silently refreshed.
- A broken or unrecognized URL route within the application.
- Any other unexpected system state that prevents the user from continuing normally.

> ℹ️ Routine validation failures (wrong password, blank field) are handled inline on the relevant page and do not trigger the Error Page.

### 7.2 What the User Sees

- Header: StowitAll wordmark (center) | Date-Time Group (top-right).
- Primary message: a dramatic, brand-voice declaration that the user has broken "the Ancient Laws of computer applications" and has been sent to the DUNGEON. Rendered in large display type.
- "Just Kidding!" block immediately below: a sincere, warm apology explaining that the team is sorry for the inconvenience and will resolve the issue as soon as possible.
- A single "Home" button at the bottom-right. This is the only navigation available from this page.

> ⚠️ The Error Page has no Log Out button. If the user's session is the cause of the error, the application should attempt to clear the session before rendering the Error Page so that clicking "Home" routes them to Login rather than back into a broken state.

### 7.3 Navigation Paths from Error Page

- Click "Home" (bottom-right) → Home Page (if session is valid) or Login state (if session was cleared).

> ⚠️ This is the only available navigation. There is no back button, no Log Out, and no direct links to other pages.

---

## 8. Full Navigation Map

The table below summarizes every navigation path available from each page state. "→" denotes a direct link. Paths marked with ✦ trigger the Smoky Veil transition.

| Page | Available Navigation |
|------|----------------------|
| Login / Sign-Up | Toggle between Login ↔ Sign-Up states (no transition). → Home ✦ (on successful login). |
| Home | → Profile (header). → Password Creation Room. → The Vault. → Contact Us. → Login ✦ (Log Out). |
| Password Creation Room | → Home (footer). → Contact Us (footer). → Login ✦ (Log Out). |
| The Vault | → Home (header only). No other direct paths. |
| Profile | → Home (footer). → Contact Us (footer). → Login ✦ (Log Out). |
| Contact Us | → Home (button below header). No other direct paths. |
| Error Page | → Home or Login (single "Home" button, depending on session state). |

> ℹ️ ✦ = Smoky Veil transition fires on this action.
