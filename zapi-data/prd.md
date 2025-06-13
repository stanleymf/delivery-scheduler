# Product Requirements Document: Delivery Management Application

## 1. Overview

This document outlines the requirements for a Shopify-integrated Delivery Management application. The application will serve as an admin dashboard for a flower delivery business, providing comprehensive tools to manage delivery and collection logistics. It will enable the business owner to define delivery zones, create and manage various types of timeslots with specific rules, control availability through a calendar system, and apply date-based restrictions to products. The system is designed to streamline operations, reduce manual scheduling errors, and provide a clear and accurate ordering experience for the end customer through a widget integrated into the Shopify storefront.

## 2. Objectives/Goals

*   To centralize and streamline the management of all delivery and collection logistics.
*   To provide customers with a clear, accurate, and seamless process for selecting delivery or collection options.
*   To automate the enforcement of business rules, such as order cut-off times, delivery quotas, and service availability.
*   To prevent orders from being placed for unavailable dates, times, or locations.
*   To enable the effective management of seasonal or time-sensitive products by restricting their purchase to specific date ranges.
*   To ensure seamless integration with the existing Shopify store for product and order data.

## 3. Features

### 3.1. Feature: Delivery Area Management

*   **Description:** This feature allows the administrator to define specific delivery zones within Singapore by allowing or blocking postal codes.
*   **Application Flows:**
    *   **Flow: Adding a Blocked Postal Code**
        1.  The administrator navigates to the "Delivery Areas" section.
        2.  The administrator enters a specific 6-digit postal code into a designated input field.
        3.  Upon submission, the system validates that it is a valid postal code format.
        4.  The postal code is added to a list of "Blocked Postal Codes," preventing customers from these addresses from placing delivery orders.
    *   **Flow: Adding a Blocked Area Code**
        1.  The administrator navigates to the "Delivery Areas" section.
        2.  The administrator enters a 2-digit area code (representing the first two digits of a postal code) into a designated input field.
        3.  Upon submission, the system validates the format.
        4.  The area code is added to a list of "Blocked Area Codes." All postal codes starting with these two digits are now considered undeliverable.
    *   **Flow: Viewing and Removing Blocked Codes**
        1.  The administrator can view two distinct lists: one for blocked postal codes and one for blocked area codes.
        2.  Each item in the list has a "Remove" or "Delete" button next to it.
        3.  Clicking this button removes the code from the blocked list, re-enabling delivery to that specific postal code or area.

### 3.2. Feature: Timeslot Management

*   **Description:** This feature enables the creation and management of all timeslots for delivery, collection, and express services.
*   **Application Flows:**
    *   **Flow: Creating a Global or Collection Timeslot**
        1.  The administrator navigates to the "Time Slots" section.
        2.  The administrator clicks "Create New Timeslot."
        3.  A form appears, requiring the following information:
            *   Start Time (e.g., 10:00)
            *   End Time (e.g., 14:00)
            *   Timeslot Type (a choice between "Delivery" or "Collection")
            *   Maximum Order Quota (a numerical input, e.g., 50)
            *   Cut-off Time (e.g., 8:00 AM on the same day, or 10:00 PM on the previous day)
        4.  The administrator then assigns this timeslot to specific days of the week (Monday to Sunday) using checkboxes.
        5.  Upon saving, the timeslot is created and becomes active according to the assigned days.
    *   **Flow: Creating an Express Timeslot**
        1.  The process is similar to creating a global timeslot, but the "Timeslot Type" is "Express."
        2.  The form will require the same fields: Start Time, End Time, Maximum Order Quota, and Cut-off Time.
        3.  The system will ensure the Express timeslot's start and end times fall within an existing Global "Delivery" timeslot.
        4.  The administrator assigns the Express timeslot to specific days of the week.
    *   **Flow: Editing or Deleting a Timeslot**
        1.  The administrator can view a list of all created timeslots.
        2.  Each timeslot in the list has "Edit" and "Delete" options.
        3.  "Edit" opens the creation form pre-filled with the timeslot's current details for modification.
        4.  "Delete" removes the timeslot from the system entirely.

### 3.3. Feature: Availability Calendar Management

*   **Description:** This feature provides a master calendar to control overall service availability.
*   **Application Flows:**
    *   **Flow: Blocking a Range of Dates**
        1.  The administrator navigates to the "Availability Calendar" section.
        2.  The calendar displays a monthly or yearly view.
        3.  The administrator can select a single date or a range of dates.
        4.  Upon selection, a "Block Dates" option appears.
        5.  Confirming this action makes all timeslots (Delivery, Collection, Express) unavailable for the selected date(s). The dates will be visually marked as blocked on the calendar.
    *   **Flow: Blocking a Specific Timeslot on a Date**
        1.  The administrator clicks on a specific, unblocked date in the calendar.
        2.  A view appears listing all active timeslots for that day.
        3.  Each timeslot has a toggle or "Block" button.
        4.  The administrator can disable a specific timeslot (e.g., block the 10:00-14:00 delivery slot for next Tuesday only).
    *   **Flow: Setting the Future Order Limit**
        1.  Within the "Availability Calendar" section, there is a setting for "Future Order Limit."
        2.  The administrator enters a number (e.g., 10).
        3.  This setting dictates that customers can only place orders for the current day plus the next 10 days. All dates beyond this limit are automatically blocked in the customer-facing widget.

### 3.4. Feature: Product Rule Management

*   **Description:** This feature allows the administrator to set date-based availability rules for specific products imported from Shopify.
*   **Application Flows:**
    *   **Flow: Applying a Date Range Rule to a Product**
        1.  The administrator navigates to the "Product Management" section.
        2.  A list of all products, pulled from the Shopify store, is displayed.
        3.  The administrator selects a product to apply a rule to.
        4.  The administrator defines a "Start Date" and an "End Date" for which this product is available for order.
        5.  When a customer adds this product to their cart, the date picker in the widget will only show available dates within this defined range.

### 3.5. Feature: Settings Management

*   **Description:** This feature allows the administrator to configure general settings for the application.
*   **Application Flows:**
    *   **Flow: Managing Collection Locations**
        1.  The administrator navigates to the "Settings" section.
        2.  An interface is available to add, edit, or delete collection location addresses.
        3.  Each new location requires a name or address.
        4.  This list of locations is presented to the customer if they choose the "Collection" option in the widget.

### 3.6. Feature: Customer Widget Live Preview

*   **Description:** A non-interactive preview within the admin dashboard that demonstrates how the configured settings will appear and behave for the end customer on the Shopify store.
*   **Application Flows:**
    *   **Flow: Previewing the Customer Journey**
        1.  The administrator navigates to the "Live Preview" section.
        2.  The preview displays a mock-up of the customer widget.
        3.  The administrator can see the initial choice ("Delivery," "Collection," "Express").
        4.  The preview will visually represent the postal code validation step for Delivery/Express.
        5.  It will show a calendar where available dates are selectable, and blocked/unavailable dates are clearly marked.
        6.  It will also show a list of timeslots, with unavailable or full slots greyed out and unselectable, reflecting the rules set in the other modules.

## 4. Technical Requirements

*   **System Architecture:**
    *   The application will be a Single Page Application (SPA) built with React.
    *   It will integrate with the Shopify Admin API to pull product data and potentially push order metadata.
    *   The application will be deployed on Railway.
    *   Persistence for the admin settings will be handled by a backend service, with a UI-only prototype using local storage initially.
*   **Functional Technical Requirements:**
    *   **Postal Code Validation:** The system must validate 6-digit Singapore postal codes and check them against the lists of blocked postal and area codes.
    *   **Timeslot Logic:** The system must correctly determine timeslot availability based on the current time, cut-off rules, and order quotas.
    *   **Calendar Logic:** The system must aggregate all rules (global blockouts, specific timeslot blockouts, future order limits, product-specific date ranges) to present a final, accurate set of available dates and times to the customer.
*   **Backend API Endpoints:**
    *   `POST /api/delivery-areas/validate`: Validates a customer's postal code against the rules.
    *   `GET /api/delivery-areas`: Retrieves the list of blocked postal and area codes for the admin dashboard.
    *   `POST /api/delivery-areas`: Adds a new blocked postal or area code.
    *   `DELETE /api/delivery-areas/{id}`: Removes a blocked code.
    *   `GET /api/timeslots`: Retrieves all configured timeslots.
    *   `POST /api/timeslots`: Creates a new timeslot.
    *   `PUT /api/timeslots/{id}`: Updates an existing timeslot.
    *   `DELETE /api/timeslots/{id}`: Deletes a timeslot.
    *   `GET /api/calendar/availability`: Retrieves the availability for a given date range for the customer widget.
    *   `POST /api/calendar/blockouts`: Creates a new date blockout.
    *   `GET /api/products`: Retrieves products from the Shopify store.
    *   `PUT /api/products/{productId}/rules`: Sets or updates the date range rule for a product.
    *   `GET /api/settings`: Retrieves current settings (e.g., collection locations).
    *   `PUT /api/settings`: Updates the settings.

## 5. Design Style

*   **Design Philosophy:** The design will be minimalist, user-centric, and highly intuitive. The primary goal is to create a clean and uncluttered interface that allows the administrator to manage complex logistics with ease and efficiency.
*   **Style & Theme:** The overall style will be clean, sleek, and modern. It will avoid heavy ornamentation in favor of functional clarity. Emojis will be used sparingly to add a touch of personality and visual guidance (e.g., a 🚚 for delivery, a 🏢 for collection).
*   **Color Palette:**
    *   **Primary:** Olive (`#616B53`) will be used for key interactive elements like buttons, active states, and headers.
    *   **Secondary:** Dust (`#E2E5DA`) will be used for backgrounds or secondary panels to create a soft, elegant contrast.
    *   **Accents:** A clean white (`#FFFFFF`) and various shades of grey will be used for text, borders, and disabled states to ensure readability and a balanced look.
*   **Typography:** A modern, highly readable sans-serif font such as Inter or Lato will be used for all text to ensure clarity across the application. A clear typographic hierarchy will be established using different font weights and sizes.
*   **Layout:** The layout will be spacious, utilizing ample white space to separate elements and guide the user's focus. A consistent grid system will be used to maintain alignment and order.

## 6. Deployment & Infrastructure

*   **Deployment Platform:** The application will be deployed on Railway, providing scalable hosting with easy CI/CD integration.
*   **Environment Configuration:** Railway will handle environment variables for API keys, database connections, and other configuration settings.
*   **Domain & SSL:** Custom domain configuration with automatic SSL certificate management through Railway.
*   **Monitoring:** Railway's built-in monitoring and logging capabilities will be utilized for application health tracking.

## 7. Assumptions / Constraints

*   The application is an admin-facing dashboard for the business owner/staff. The scope of this PRD does not include the development of the final, public-facing Shopify theme widget itself, but rather its preview.
*   Product and order data is sourced exclusively from a single, pre-existing Shopify store via its API.
*   The application is intended for use by a single business and does not require multi-tenant capabilities.
*   The target market is Singapore; therefore, postal code validation and other location-based logic are specific to Singaporean standards.
*   The initial implementation will be a UI-only prototype. Persistence will be handled by the browser's local storage, and backend API calls will be mocked.
*   Railway deployment will handle scaling and infrastructure management automatically.