# Freight Operations Management System (FOMS)

## Short Description
The Freight Operations Management System (FOMS) is a web-based minimum viable product (MVP) that simulates core freight and logistics workflows. The system models shipment creation, driver assignment, shipment status updates, and delivery confirmation using internally generated, simulated data. This project is developed for educational purposes as part of a senior capstone course.

---

## Overview
FOMS is a centralized freight operations platform designed to demonstrate how logistics systems manage shipments across multiple user roles. The system allows shipments to move through a defined lifecycle—from creation to delivery—while providing visibility into shipment status and history. The project emphasizes software engineering concepts such as client–server architecture, role-based access control, data persistence, and event-driven state updates.

---

## Project Goals
- Demonstrate end-to-end workflow management in a logistics-style system  
- Model event-driven shipment state changes  
- Implement role-based user interactions and permissions  
- Apply software engineering principles learned throughout the program  

---

## MVP Scope
The MVP supports the following features using simulated internal data only:
- Shipment creation, viewing, updating, and deletion
- Assignment of shipments to drivers
- Event-driven shipment status updates
- Role-based access for Shipper, Driver, and Administrator users
- Generation and viewing of delivery confirmation records

Out of scope for the MVP:
- External carrier APIs (FedEx, UPS, etc.)
- Real GPS tracking
- Billing or payment processing
- Enterprise-grade security features

---

## User Roles
- **Shipper**: Creates and manages shipments and tracks shipment progress  
- **Driver**: Updates shipment status and confirms delivery for assigned shipments  
- **Administrator**: Manages user accounts and assigns drivers to shipments  

---

## Technology Stack
- **Language:** TypeScript  
- **Framework:** Next.js (full-stack web application)  
- **Database:** SQLite (development)  
- **ORM:** Prisma  
- **Architecture:** Client–server with REST-style API routes  

This stack was chosen to support rapid development, clear system structure, and reliable demonstration.

---

## Project Status
This project is currently in the **initial requirements and early implementation phase**. Development will proceed incrementally throughout the semester, guided by approved project requirements.

---

## Documentation
Additional documentation can be found in the `docs/` directory:
- `initial-requirements.md` – Initial Requirements Document (CSE 499)
- `weekly-reports/` – Weekly status reports and progress updates
- `architecture.md` – System architecture and design notes (as developed)

---

## Disclaimer
This project uses **simulated data only** and is intended strictly for educational purposes. It does not integrate with real freight carriers, logistics providers, or external services.

---

## Author
Brendan Willis  
CSE 499 – Senior Project
