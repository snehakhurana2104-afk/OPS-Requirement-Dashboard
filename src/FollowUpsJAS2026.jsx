import React, { useEffect, useMemo, useState } from "react";
import "./FollowUpsJAS2026.css";

const STORAGE_KEY = "opsFollowUpsJAS2026RowsV1";
const STATUS_KEY = "opsFollowUpsJAS2026DecisionsV1";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const OPS_PERSONS = ["Kamal", "Tisha", "Sneha", "Abhishek"];
const SALES_PERSONS = ["Prabodh", "Amit", "Srishti", "Rakhi"];
const REQUIREMENT_STATUSES = ["Served", "Regret"];
const EVALUATION_STATUSES = ["Yes", "No"];

const EMPTY_FORM = {
  sNo: "",
  clientProposalSharedDate: "",
  clientProposalSharedTime: "",
  requirementName: "",
  assignedOpsPerson: "",
  salesPerson: "",
  clientName: "",
  requirementStatus: "",
  trainerName: "",
  trainerContactDetails: "",
  evaluationCallStatus: "",
};

const RAW_RECORDS = [
  {
    sNo: 1,
    date: "14-Jul-2026",
    time: "1:44 PM",
    requirement:
      "Training Requirement : BRP_Python Advance Training_Manjunath Alur",
    ops: "",
    sales: "Tisha",
    client: "",
    status: "Served",
    trainer: "Rajeev and ronny",
    contact: "HCL",
    evaluation: "No",
  },
  {
    sNo: 2,
    date: "15-Jul-2026",
    time: "5:25 PM",
    requirement:
      "Trainer + Lab requirement: Weblogic L2 and L3 Academy Training",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Md Noorullah",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 3,
    date: "15-Jul-2026",
    time: "5:48 PM",
    requirement:
      "Trainer + Lab requirement: WebSphere L2 and L3 Academy Training",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Honey",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 4,
    date: "16-Jul-2026",
    time: "10:27 AM",
    requirement:
      "Trainer + Lab requirement: JBoss L2 and L3 Academy Training",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Noor",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 5,
    date: "16-Jul-2026",
    time: "1:28 PM",
    requirement:
      "Chainsys ( Claude AI Training) – SSDN Technologies",
    ops: "Kanika",
    sales: "",
    client: "Intellectt Inc",
    status: "Served",
    trainer: "Vikram Mohan",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 6,
    date: "20-Jul-2026",
    time: "10:52 AM",
    requirement: "SAP IS-Retail Training Plan",
    ops: "Kanika",
    sales: "",
    client: "Buckman",
    status: "Served",
    trainer: "Annamalai",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 7,
    date: "16-Jul-2026",
    time: "1:18 PM",
    requirement:
      "Training and Content Development Services :SSDN",
    ops: "Kanika",
    sales: "",
    client: "Marriott Hotels Dubai",
    status: "Served",
    trainer: "Dr Manoj",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 8,
    date: "20-Jul-2026",
    time: "7:07 PM",
    requirement:
      "TNI- Genesys cloud Administration and Architect Training Requirement from BD Account",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Justin",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 9,
    date: "16-Jul-2026",
    time: "6:50 PM",
    requirement:
      "Training Requirement : Prince 2 Foundation Training & Certification",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Kanika",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 10,
    date: "17-Jul-2026",
    time: "9:52 PM",
    requirement:
      "Need support for competitive rates || Tracks- Agentic AI & Product Development with Claude Code",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Tripat",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 11,
    date: "20-Jul-2026",
    time: "4:29 PM",
    requirement:
      "Leadership Development Program – Bangalore | Corporate Leadership Trainer",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Ashok",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 12,
    date: "20-Jul-2026",
    time: "7:03 PM",
    requirement:
      "Gen AI for Project Management Training & Certification",
    ops: "Tisha",
    sales: "",
    client: "B2C",
    status: "Served",
    trainer: "Tarek (OEM)",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 13,
    date: "20-Jul-2026",
    time: "3:04 PM",
    requirement: "DFS-Academy-Vmware-L2",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Ajay",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 14,
    date: "20-Jul-2026",
    time: "5:25 PM",
    requirement: "Azure Devops & Azure AI",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Dawa",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 15,
    date: "21-Jul-2026",
    time: "10:58 AM",
    requirement:
      "Labs requirement for OpenShift Admin training - DFS (Jul'26)",
    ops: "Kanika",
    sales: "",
    client: "Kion Group",
    status: "Served",
    trainer: "Deepak jaju",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 16,
    date: "22-Jul-2026",
    time: "10:48 AM",
    requirement: "PR737054 / Approval Needed: BITS AI Training",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Shital",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 17,
    date: "22-Jul-2026",
    time: "2:08 PM",
    requirement: "Redwood training details - Reg",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Pradeep",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 18,
    date: "24-Jul-2026",
    time: "1:22 PM",
    requirement:
      "PR736024 - Defensible Security Architecture and Engineering Certifications",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Ratnesh",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 19,
    date: "23-Jul-2026",
    time: "10:43 AM",
    requirement:
      "PR736023 - TOGAF® Foundation and Practitioner Course",
    ops: "Kanika",
    sales: "",
    client: "EXL Service",
    status: "Served",
    trainer: "Vinod Kumar",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 20,
    date: "22-Jul-2026",
    time: "6:34 PM",
    requirement: "Training Requirement - Oracle (HCL)",
    ops: "Tisha",
    sales: "",
    client: "EXL Service",
    status: "Served",
    trainer: "Ratnesh",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 21,
    date: "23-Jul-2026",
    time: "5:36 PM",
    requirement:
      "URGENT: Managed Services requirement for SRE training || Enterprise Customer (Jul-Sep'26)",
    ops: "Kanika",
    sales: "",
    client: "ACCESS Development",
    status: "Served",
    trainer: "Swapnil",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 22,
    date: "24-Jul-2026",
    time: "12:47 PM",
    requirement: "Proposal submission for CICO DNAC-IBNTRN",
    ops: "Tisha",
    sales: "",
    client: "GD Goenka",
    status: "Served",
    trainer: "Sivananda",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 23,
    date: "25-Jul-2026",
    time: "3:08 PM",
    requirement:
      "AI Training Requirement Discussion | BP Oil Mills Limited & SSDN Technologies",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Azim",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 24,
    date: "28-Jul-2026",
    time: "7:02 PM",
    requirement:
      "BRP Request | Oracle AI Cloud Database Services 2025 Professional",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Bharti",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 25,
    date: "27-Jul-2026",
    time: "5:34 PM",
    requirement:
      "Trainer + Lab requirement: DFS-Academy-MYSQL-L2 Academy",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Debraj/Preetam/Priya",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 26,
    date: "28-Jul-2026",
    time: "10:55 AM",
    requirement: "Redwood training details - Reg",
    ops: "Kanika",
    sales: "",
    client: "LTM",
    status: "Served",
    trainer: "Vinod Kumar",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 27,
    date: "30-Jul-2026",
    time: "3:01 PM",
    requirement: "BRP_ Akamai training_UHG",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Sunny/Kushal/Mahendra",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 28,
    date: "31-Jul-2026",
    time: "12:25 PM",
    requirement:
      "LTM Training Requirements - Oracle Field Service Cloud (OFSC)",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Himanshu",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 29,
    date: "30-Jul-2026",
    time: "2:03 PM",
    requirement:
      "Corporate Personality Development & Soft skills Training for Digitoonz Media & Entertainment Pvt. Ltd.- SSDN Technologies",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Manikandan",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 30,
    date: "31-Jul-2026",
    time: "8:32 AM",
    requirement:
      "AWS Kiro Subscription || Enterprise Customer Training",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Nivas/Indraneel",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 31,
    date: "05-Aug-2026",
    time: "2:08 PM",
    requirement:
      "New Procurement Requirement - Agentic AI Capability Development Program/SSDN",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Sreenivas",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 32,
    date: "04-Aug-2026",
    time: "11:37 AM",
    requirement: "Ivy_Homes_Trainer_Requirement_Brief",
    ops: "Tisha",
    sales: "",
    client: "Chainsys",
    status: "Served",
    trainer: "Shantanu",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 33,
    date: "03-Aug-2026",
    time: "5:53 PM",
    requirement: "SAP IS-Retail Training Plan",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Sairam",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 34,
    date: "05-Aug-2026",
    time: "5:28 PM",
    requirement:
      "Corporate Technical Training ( Zscaler, Network Management ) for Corporate Infotech Pvt Ltd || SSDN Technologies",
    ops: "Tisha",
    sales: "",
    client: "EXL Service",
    status: "Served",
    trainer: "Amarjeet",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 35,
    date: "06-Aug-2026",
    time: "7:14 PM",
    requirement:
      "RFQ Regarding Life-skill trainer requirement for Jammu and Kashmir | LSI",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Sameer",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 36,
    date: "10-Aug-2026",
    time: "5:06 PM",
    requirement:
      "New Procurement Requirement: AI Security Program / SSDN",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Krishnan",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 37,
    date: "10-Aug-2026",
    time: "5:12 PM",
    requirement:
      "Trainer profile required | Vectra AI Training - Instructor Led | BRP | OEM",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Manikandan",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 38,
    date: "08-Aug-2026",
    time: "2:54 PM",
    requirement:
      "RFQ Regarding Life-skill trainer requirement for Jammu and Kashmir | LSI (Solan, Himachal Pradesh)",
    ops: "Tisha",
    sales: "",
    client: "Trellance",
    status: "Served",
    trainer: "Abdul",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 39,
    date: "08-Aug-2026",
    time: "6:53 PM",
    requirement:
      "Public Speaking & Communication Training for Ace Group || SSDN Technologies",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Thomas",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 40,
    date: "10-Aug-2026",
    time: "3:14 PM",
    requirement: "Labs requirement for AZ-802 training - DFS",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Eshan",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 41,
    date: "10-Aug-2026",
    time: "5:52 PM",
    requirement:
      "Request for BRP - PostgreSQL Database Administration (DBA)",
    ops: "Tisha",
    sales: "",
    client: "Hella",
    status: "Served",
    trainer: "Justin Babu",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 42,
    date: "18-Aug-2026",
    time: "11:08 AM",
    requirement:
      "Request for BRP - SingleStore Database Administration (DBA)",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Vikas",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 43,
    date: "11-Aug-2026",
    time: "5:48 PM",
    requirement: "Program Manager Training and Certification",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Yogesh",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 44,
    date: "11-Aug-2026",
    time: "6:47 PM",
    requirement:
      "AI Training for Nuvama Wealth|| SSDN Technologies",
    ops: "Tisha",
    sales: "",
    client: "FocusRTech",
    status: "Served",
    trainer: "Vimal/Bhavesh",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 45,
    date: "11-Aug-2026",
    time: "6:14 PM",
    requirement:
      "Scrum master Training & certification || Public batch",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "N/A",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 46,
    date: "22-Aug-2026",
    time: "1:20 AM",
    requirement: "Labs required for trainings",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Ajay",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 47,
    date: "22-Aug-2026",
    time: "1:27 AM",
    requirement: "LABS Requirement",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Rayudu",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 48,
    date: "13-Aug-2026",
    time: "5:31 PM",
    requirement: "BRP_Service Now ITOM_Rahul Kumar",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Gaurav (koenig)",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 49,
    date: "13-Aug-2026",
    time: "6:11 PM",
    requirement:
      "Posh Training for Infinit-O || SSDN Technologies",
    ops: "Kanika",
    sales: "",
    client: "BNP",
    status: "Served",
    trainer: "Ramki (Staragile)",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 50,
    date: "18-Aug-2026",
    time: "5:43 PM",
    requirement:
      "LTM Training Requirements - Java and Dotnet Full Stack Trainers",
    ops: "Tisha",
    sales: "",
    client: "BP Oil Mills Ltd.",
    status: "Served",
    trainer: "Ahmed",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 51,
    date: "17-Aug-2026",
    time: "1:27 PM",
    requirement:
      "Training & Certification Requirement - Big Fix",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Suman",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 52,
    date: "17-Aug-2026",
    time: "4:09 PM",
    requirement: "Program Manager Training and Certification",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Prem",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 53,
    date: "19-Aug-2026",
    time: "6:44 PM",
    requirement:
      "PR736024 - Defensible Security Architecture and Engineering Certifications",
    ops: "Tisha",
    sales: "",
    client: "FocusRTech",
    status: "Served",
    trainer: "Vinod Kumar",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 54,
    date: "19-Aug-2026",
    time: "10:35 AM",
    requirement:
      "Copilot Studio Training for Arada Properties || SSDN Technologies",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Mohammed Noorulla",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 55,
    date: "19-Aug-2026",
    time: "12:38 PM",
    requirement:
      "ITIL Foundation V5 Training for Black Rock || SSDN Technologies",
    ops: "Tisha",
    sales: "",
    client: "LTM",
    status: "Served",
    trainer: "Aparna",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 56,
    date: "19-Aug-2026",
    time: "5:46 PM",
    requirement:
      "Training Request: PMP training & certification Quotations",
    ops: "Kanika",
    sales: "",
    client: "Digitoonz Media & Entertainment",
    status: "Served",
    trainer: "Tarkeshwar/Manish",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 57,
    date: "24-Aug-2026",
    time: "3:21 PM",
    requirement: "Fresher + KLA Allocation",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Ahmed",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 58,
    date: "25-Aug-2026",
    time: "12:09 PM",
    requirement:
      "Data Center Infrastructure Training || SSDN Technologies X Vodafone ||",
    ops: "Tisha",
    sales: "",
    client: "EXL",
    status: "Served",
    trainer: "Sreenivas / Praveen",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 59,
    date: "21-Aug-2026",
    time: "1:48 PM",
    requirement:
      "RFQ Regarding Life-skill trainer requirement for Jammu and Kashmir | LSI",
    ops: "Kanika",
    sales: "",
    client: "IVY",
    status: "Served",
    trainer: "Rayudu",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 60,
    date: "20-Aug-2026",
    time: "7:08 PM",
    requirement: "Training Requirement||Omnissa",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Aman and Alka",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 61,
    date: "22-Aug-2026",
    time: "7:23 PM",
    requirement: "PROXMOX & ORACLE - RFQ FOR COST PROPOSAL",
    ops: "Kanika",
    sales: "",
    client: "CIPL",
    status: "Served",
    trainer: "Rajesh (Vinita FeatherThread)",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 62,
    date: "21-Aug-2026",
    time: "12:51 PM",
    requirement: "BRP_Service Now ITOM_Rahul Kumar",
    ops: "Tisha",
    sales: "",
    client: "Bharti Airtel",
    status: "Served",
    trainer: "Nupur",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 63,
    date: "21-Aug-2026",
    time: "3:36 PM",
    requirement:
      "Quote for trainings || AI powered Excel training",
    ops: "Tisha",
    sales: "",
    client: "EXL",
    status: "Served",
    trainer: "N/A",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 64,
    date: "22-Aug-2026",
    time: "7:28 PM",
    requirement:
      "Corporate Risk & Compliance Management Training || SSDN Technologies x Terra Motors ||",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Himanshu & Sandeep",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 65,
    date: "22-Aug-2026",
    time: "4:48 PM",
    requirement:
      "Business Etiquettes Workshop || Saket || Maha Vastu x SSDN Technologies ||",
    ops: "Tisha",
    sales: "",
    client: "Bharti Airtel",
    status: "Served",
    trainer: "Sundaram / Priyadarshani",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 66,
    date: "25-Aug-2026",
    time: "3:27 PM",
    requirement:
      "Passive Infrastructure Cabling Design Training | SSDN Technologies",
    ops: "Kanika",
    sales: "",
    client: "Ace Group",
    status: "Served",
    trainer: "Alagu (koenig)",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 67,
    date: "07-Sep-2026",
    time: "5:58 PM",
    requirement:
      "LTM Training Requirements - BIAN Foundation & Practitioner Certification",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Vikas / Gopi",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 68,
    date: "26-Aug-2026",
    time: "10:42 AM",
    requirement:
      "BRP_JIRA & Agile project management practices_Ravindaran Sukumaran",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Wasim&Muntazir",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 69,
    date: "29-Aug-2026",
    time: "3:34 PM",
    requirement: "Vendor / staffing needs - Ai Awareness",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Kumar (Honey)",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 70,
    date: "25-Aug-2026",
    time: "6:30 PM",
    requirement:
      "Posh Training for Ingeniworx Business Solutions || SSDN Technologies",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Sundaram",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 71,
    date: "25-Aug-2026",
    time: "4:48 PM",
    requirement:
      "GCP License and Certification Cost || Urgent",
    ops: "Kanika",
    sales: "",
    client: "Nuvama Welath",
    status: "Served",
    trainer: "Dr. B Gupta",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 72,
    date: "27-Aug-2026",
    time: "11:19 AM",
    requirement: "BRP_Datadog Training_Dhineshbabu",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Dr. B Gupta & Ankita",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 73,
    date: "26-Aug-2026",
    time: "3:51 PM",
    requirement:
      "Training Requirement - Vulnerability Management Team",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "N/A",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 74,
    date: "03-Sep-2026",
    time: "5:35 PM",
    requirement: "LAB Requirement: Komprise File Migration.",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Shubhali",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 75,
    date: "07-Aug-2026",
    time: "4:58 PM",
    requirement:
      "Enterprise requirement || Urgent II Doc5854147640",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Ajay",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 76,
    date: "01-Sep-2026",
    time: "3:52 PM",
    requirement:
      "Enterprise requirement || High Priority ***",
    ops: "Tisha",
    sales: "",
    client: "Infinit-O",
    status: "Served",
    trainer: "Pramod & Partha",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 77,
    date: "27-Aug-2026",
    time: "4:12 PM",
    requirement:
      "GCP License and Certification Cost || Urgent II Doc5854147667",
    ops: "Kanika",
    sales: "",
    client: "LTM",
    status: "Served",
    trainer: "Omprakash",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 78,
    date: "29-Aug-2026",
    time: "2:58 AM",
    requirement:
      "ISO 26000 Lead Auditor Training || Control Union x SSDN Technologies ||",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "N/A",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 79,
    date: "09-Sep-2026",
    time: "2:32 PM",
    requirement: "Upskill plan for Rakuten resources",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "N/A",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 80,
    date: "01-Sep-2026",
    time: "12:07 PM",
    requirement:
      "Training Requirement - TOGAF (The Open Group Architecture Framework)",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "N/A",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 81,
    date: "01-Sep-2026",
    time: "10:43 PM",
    requirement:
      "Labs requirement for Juniper MIST training - DFS (Sep'26) II Doc5859044966",
    ops: "Kanika",
    sales: "",
    client: "Arada Properties",
    status: "Served",
    trainer: "Sweta",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 82,
    date: "04-Sep-2026",
    time: "6:51 PM",
    requirement:
      "Creo simulation training requirement II FY26 II Doc id - Doc5860019425",
    ops: "Tisha",
    sales: "",
    client: "Black Rock",
    status: "Served",
    trainer: "Pooja/Vidhi",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 83,
    date: "01-Sep-2026",
    time: "7:18 PM",
    requirement:
      "PR736024 - Defensible Security Architecture and Engineering Certifications",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Saratha",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 84,
    date: "02-Sep-2026",
    time: "2:32 PM",
    requirement:
      "Request to Share the Cots for PMP Vouchers_India",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Hari",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 85,
    date: "07-Sep-2026",
    time: "5:33 PM",
    requirement:
      "GWO (Global Wind Organization) basic Safety standards Training for Vestas Team (for 4 Engineers)",
    ops: "Kanika",
    sales: "",
    client: "Vodafone",
    status: "Served",
    trainer: "Sairam",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 86,
    date: "04-Sep-2026",
    time: "5:28 PM",
    requirement:
      "Labs requirement for F5 BIG-IP training",
    ops: "Tisha",
    sales: "",
    client: "Bharti Airtel",
    status: "Served",
    trainer: "Tamal (Staragile)",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 87,
    date: "10-Sep-2026",
    time: "1:38 PM",
    requirement:
      "Cisco Secure Access Training II Doc5865271385",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Gaurav",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 88,
    date: "10-Sep-2026",
    time: "2:55 PM",
    requirement: "RFQ / Training /G+D",
    ops: "Tisha",
    sales: "",
    client: "BNP",
    status: "Served",
    trainer: "Vikas",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 89,
    date: "07-Sep-2026",
    time: "4:28 PM",
    requirement:
      "OT Cybersecurity Training Certification online course",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Shalini",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 90,
    date: "08-Sep-2026",
    time: "11:21 AM",
    requirement:
      "Claude trg. for project team II Doc5867918293",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Swati & Tapati",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 91,
    date: "08-Sep-2026",
    time: "6:58 PM",
    requirement:
      "GitHub Training Request II Doc5869236041",
    ops: "Kanika",
    sales: "",
    client: "Terra Motors",
    status: "Served",
    trainer: "Pritesh",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 92,
    date: "09-Sep-2026",
    time: "2:55 PM",
    requirement:
      "License requirement for Agentic AI training - EDS (Sep'26)",
    ops: "Kanika",
    sales: "",
    client: "Maha Vastu",
    status: "Served",
    trainer: "Bharathi (SMentor)",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 93,
    date: "10-Sep-2026",
    time: "3:48 PM",
    requirement:
      "Training enquiry: AAIA and AAISM",
    ops: "Tisha",
    sales: "",
    client: "Hani A (Intuitor IT)",
    status: "Served",
    trainer: "Vijay (networkbulls)",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 94,
    date: "10-Sep-2026",
    time: "11:48 AM",
    requirement:
      "Lab Availability & Cost per Participant – Confirmed Training",
    ops: "Kanika",
    sales: "",
    client: "LTM",
    status: "Served",
    trainer: "B P Gupta",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 95,
    date: "10-Sep-2026",
    time: "5:17 PM",
    requirement:
      "Need support for RFP submission || Urgent ***",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "R Gopi",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 96,
    date: "11-Sep-2026",
    time: "3:59 PM",
    requirement:
      "LTM Training Requirements - AI in Project Management",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Nagaraja & Suresh",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 97,
    date: "14-Sep-2026",
    time: "5:32 PM",
    requirement:
      "Training+Lab and Extended Lab Requirement | Apple Support + JAMF L2",
    ops: "Tisha",
    sales: "",
    client: "Ingeniworx Business Solutions",
    status: "Served",
    trainer: "Sukhwinder",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 98,
    date: "14-Sep-2026",
    time: "4:08 PM",
    requirement:
      "License requirement for Cisco Network Data training || DFS II Doc5874927811",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Gopi / Abhishek / Malathi",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 99,
    date: "15-Sep-2026",
    time: "5:29 PM",
    requirement:
      "BRP_Splunk Basic and Enterprise Administration Training_Equinor II Doc5881027018",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Varun",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 100,
    date: "15-Sep-2026",
    time: "1:00 PM",
    requirement:
      "BRP_Cisco Catalyst Centre (DNAC) with advance feature0073_Equinor II Doc5881061004",
    ops: "Kanika",
    sales: "",
    client: "UCB",
    status: "Served",
    trainer: "Vishal",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 101,
    date: "15-Sep-2026",
    time: "7:06 PM",
    requirement:
      "Doc5881061042 - SHRM Essentials of Human Resource Management",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Manish/Nidhi",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 102,
    date: "15-Sep-2026",
    time: "4:58 PM",
    requirement:
      "Doc5881102292 - Business Communication and Executive Presence",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Sumanta",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 103,
    date: "15-Sep-2026",
    time: "4:52 PM",
    requirement:
      "Doc5881102319 - Power BI Fundamentals for Business Users",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Sankarsan",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 104,
    date: "16-Sep-2026",
    time: "8:47 PM",
    requirement: "PAL E Training & Certification Rate Card",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Sangeeta",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 105,
    date: "16-Sep-2026",
    time: "7:00 PM",
    requirement:
      "Request for BRP - Training on Microsoft SQL Server Administration",
    ops: "Kanika",
    sales: "",
    client: "ControlUnion",
    status: "Served",
    trainer: "N/A",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 106,
    date: "17-Sep-2026",
    time: "6:58 PM",
    requirement:
      "Request for BRP - Training on Autonomous Database Services - Oracle",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Vinu",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 107,
    date: "18-Sep-2026",
    time: "2:49 PM",
    requirement:
      "Introducing SSDN Technologies as leading IT Training Provider || SSDN x Maruti Suzuki || (Time Management/Negotiation Tactics (Behavioural)/Conflict management)",
    ops: "Tisha",
    sales: "",
    client: "Viatris",
    status: "Served",
    trainer: "Shital/ Nirmala",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 108,
    date: "22-Sep-2026",
    time: "12:08 PM",
    requirement:
      "URGENT: Managed Services requirement for Embedded IOT Projects training - HEI (Sep-Oct'26)",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Adeel",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 109,
    date: "23-Sep-2026",
    time: "12:37 PM",
    requirement:
      "TECHNICAL SALES TRAINING FOR TECHSOL CGS ENERGY PRIVATE LIMITED",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Anjali",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 110,
    date: "24-Sep-2026",
    time: "10:27 AM",
    requirement:
      "Corporate Etiquette Training for NICDC Logistics Data Services Limited - SSDN Technologies",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Ajay",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 111,
    date: "24-Sep-2026",
    time: "12:27 PM",
    requirement:
      "Training+Lab and Extended Lab Requirement | Citrix VDI AVD L3 - JAS'26 Doc5896723910",
    ops: "Tisha",
    sales: "",
    client: "Ducis",
    status: "Served",
    trainer: "Vivek",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 112,
    date: "30-Sep-2026",
    time: "8:12 PM",
    requirement: "TNI-Atera II Doc5899370493",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Raashid",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 113,
    date: "24-Sep-2026",
    time: "3:08 PM",
    requirement:
      "ITIL 5 Foundation Training Support | SSDN Technologies",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "N/A",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 114,
    date: "25-Sep-2026",
    time: "3:41 PM",
    requirement:
      "Training Request || Agile Foundation training & certification - Public Batch",
    ops: "Kanika",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "refer to mail",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 115,
    date: "28-Sep-2026",
    time: "4:45 PM",
    requirement:
      "Training Requirement : BRP_Certified Kubernetes Admin Training_Naveen Chandra",
    ops: "Kanika",
    sales: "",
    client: "Gi-De",
    status: "Served",
    trainer: "Kushal",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 116,
    date: "30-Sep-2026",
    time: "5:27 PM",
    requirement:
      "Training Requirement : BMC Control M Admin Academy",
    ops: "Kanika",
    sales: "",
    client: "MIDREX",
    status: "Served",
    trainer: "Deeksha",
    contact: "",
    evaluation: "No",
  },
  {
    sNo: 117,
    date: "29-Sep-2026",
    time: "1:54 PM",
    requirement:
      "RFQ-JAMF 200 - PROPOSAL TO SUBMIT BY 03:00PM ON 29.09",
    ops: "Tisha",
    sales: "",
    client: "HCL",
    status: "Served",
    trainer: "Ajay",
    contact: "",
    evaluation: "No",
  },
];

const MONTHS = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const parseDate = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const text = String(value).trim();

  let match = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (match) {
    return new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1])
    );
  }

  match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );
  }

  match = text.match(/^(\d{1,2})[- ]([A-Za-z]{3,9})[- ](\d{4})$/);
  if (match) {
    const month = MONTHS[match[2].toLowerCase()];
    if (month !== undefined) {
      return new Date(
        Number(match[3]),
        month,
        Number(match[1])
      );
    }
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  );
};

const parseTimeParts = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { hours: value.getHours(), minutes: value.getMinutes(), seconds: value.getSeconds() };
  }

  const text = String(value).trim().toUpperCase();

  const ampmMatch = text.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)$/);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = Number(ampmMatch[2] || 0);
    const seconds = Number(ampmMatch[3] || 0);
    const period = ampmMatch[4];

    if (hours === 12) hours = 0;
    if (period === "PM") hours += 12;

    return { hours, minutes, seconds };
  }

  const twentyFourHourMatch = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (twentyFourHourMatch) {
    return {
      hours: Number(twentyFourHourMatch[1]),
      minutes: Number(twentyFourHourMatch[2]),
      seconds: Number(twentyFourHourMatch[3] || 0),
    };
  }

  const numeric = Number(text);
  if (Number.isFinite(numeric) && numeric >= 0 && numeric < 1) {
    const totalSeconds = Math.round(numeric * 24 * 60 * 60);
    return {
      hours: Math.floor(totalSeconds / 3600) % 24,
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  }

  return null;
};

const parseDateTime = (dateValue, timeValue) => {
  const date = parseDate(dateValue);
  if (!date) return null;

  const time = parseTimeParts(timeValue);

  const result = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time?.hours || 0,
    time?.minutes || 0,
    time?.seconds || 0,
    0
  );

  return result;
};

const formatTime = (value) => {
  const time = parseTimeParts(value);
  if (!time) return "—";

  const period = time.hours >= 12 ? "PM" : "AM";
  const hours12 = time.hours % 12 || 12;

  return `${hours12}:${String(time.minutes).padStart(2, "0")} ${period}`;
};

const formatDate = (value) => {
  const date = parseDate(value);

  if (!date) return "—";

  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
};

const formatInputDate = (value) => {
  const date = parseDate(value);

  if (!date) return "";

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const isSpecial = (clientName) =>
  /\b(HCL|EXL|BNP|LTM|UCB)\b/i.test(String(clientName || ""));

const nextWorkingDay = (date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  while (result.getDay() === 0 || result.getDay() === 6) {
    result.setDate(result.getDate() + 1);
  }

  return result;
};

const followUpSchedule = (baseValue, clientName) => {
  const base = parseDate(baseValue);

  if (!base) return [];

  const special = isSpecial(clientName);

  const gaps = special
    ? [3, 4, 4, 4, 4]
    : [2, 2, 5, 5, 5];

  let previous = new Date(base);

  return gaps.map((gap, index) => {
    const calculated = new Date(previous);

    calculated.setDate(calculated.getDate() + gap);

    const actual = nextWorkingDay(calculated);

    previous = actual;

    return {
      number: index + 1,
      date: actual,
    };
  });
};

const normalizeRows = (rows) =>
  (Array.isArray(rows) ? rows : []).map((row, index) => ({
    ...row,
    sNo: row.sNo ?? index + 1,
  }));

const convertRawRecords = () =>
  RAW_RECORDS.map((record) => ({
    id: `jas-seed-${record.sNo}`,
    sNo: record.sNo,
    clientProposalSharedDate: record.date,
    clientProposalSharedTime: record.time,
    requirementName: record.requirement,
    assignedOpsPerson: record.ops,
    salesPerson: record.sales,
    clientName: record.client,
    requirementStatus: record.status,
    trainerName: record.trainer,
    trainerContactDetails: record.contact,
    evaluationCallStatus: record.evaluation,
  }));

const buildTaskPayload = (row) => ({
  requirementId: row.requirementId || row.id,
  sNo: row.sNo,
  clientProposalSharedDate: row.clientProposalSharedDate,
  clientProposalSharedTime: row.clientProposalSharedTime,
  requirementName: row.requirementName,
  assignedOpsPerson: row.assignedOpsPerson,
  salesPerson: row.salesPerson,
  clientName: row.clientName,
  requirementStatus: row.requirementStatus,
  trainerName: row.trainerName,
  trainerContactDetails: row.trainerContactDetails,
  evaluationCallStatus: row.evaluationCallStatus,
  followUp: row.followUp || "",
  taskTitle: `Task - ${row.requirementName}`,
  taskDescription:
    `Requirement: ${row.requirementName}\n` +
    `Client: ${row.clientName}\n` +
    `Assigned OPS: ${row.assignedOpsPerson}\n` +
    `Sales Person: ${row.salesPerson}`,
  dueDate: row.clientProposalSharedDate,
  taskStatus: "Pending",
});

function FollowUpsJAS2026({ rows = [] }) {
  const seededRows = useMemo(() => {
    const incoming = normalizeRows(rows);

    if (incoming.length) return incoming;

    return convertRawRecords();
  }, [rows]);

  const [localRows, setLocalRows] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "null"
      );

      if (Array.isArray(saved) && saved.length) {
        return saved;
      }

      return convertRawRecords();
    } catch {
      return convertRawRecords();
    }
  });

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [decisionMap, setDecisionMap] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(STATUS_KEY) || "{}"
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved && seededRows.length) {
        setLocalRows(seededRows);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(seededRows)
        );
      }
    } catch {}
  }, [seededRows]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(localRows)
      );
    } catch {}
  }, [localRows]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STATUS_KEY,
        JSON.stringify(decisionMap)
      );
    } catch {}
  }, [decisionMap]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = !q
      ? localRows
      : localRows.filter((row) =>
          Object.values(row).some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(q)
          )
        );

    return [...filtered].sort((a, b) => {
      const da =
        parseDateTime(
          a.clientProposalSharedDate,
          a.clientProposalSharedTime
        )?.getTime() ?? -Infinity;

      const db =
        parseDateTime(
          b.clientProposalSharedDate,
          b.clientProposalSharedTime
        )?.getTime() ?? -Infinity;

      return db - da;
    });
  }, [localRows, search]);

  const stats = useMemo(
    () => ({
      total: localRows.length,

      served: localRows.filter(
        (r) =>
          String(r.requirementStatus || "").toLowerCase() ===
          "served"
      ).length,

      followUps: localRows.length,

      evaluations: localRows.filter(
        (r) =>
          String(r.evaluationCallStatus || "").toLowerCase() ===
          "yes"
      ).length,
    }),
    [localRows]
  );

  const openCreate = () => {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
      sNo: String(localRows.length + 1),
    });

    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id ?? row.sNo);

    setForm({
      ...EMPTY_FORM,
      ...row,
      clientProposalSharedDate:
        formatInputDate(
          row.clientProposalSharedDate
        ),
    });

    setShowForm(true);
  };

  const save = async (event) => {
    event.preventDefault();

    setSaving(true);

    try {
      const cleaned = {
        ...form,
        clientProposalSharedDate:
          form.clientProposalSharedDate,
        clientProposalSharedTime:
          form.clientProposalSharedTime,
      };

      const id =
        editingId ??
        `jas-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      cleaned.id = id;

      if (editingId === null) {
        setLocalRows((previous) => [
          ...previous,
          cleaned,
        ]);

        try {
          await fetch(`${API_BASE_URL}/tasks`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(
              buildTaskPayload(cleaned)
            ),
          });
        } catch {}
      } else {
        setLocalRows((previous) =>
          previous.map((row) =>
            (row.id ?? row.sNo) === editingId
              ? cleaned
              : row
          )
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  };

  const remove = (row) => {
    if (
      !window.confirm(
        `Delete ${
          row.requirementName || "this requirement"
        } from Follow Ups JAS'2026 only?`
      )
    ) {
      return;
    }

    const key = row.id ?? row.sNo;

    setLocalRows((previous) =>
      previous.filter(
        (item) => (item.id ?? item.sNo) !== key
      )
    );
  };

  const decision = (row, number, value) => {
    const key = `${
      row.id ?? row.sNo
    }-followup-${number}`;

    setDecisionMap((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const clearPageData = () => {
    if (
      !window.confirm(
        "This clears only Follow Ups JAS'2026 data. Dashboard data will not be changed. Continue?"
      )
    ) {
      return;
    }

    setLocalRows([]);
    setDecisionMap({});

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STATUS_KEY);
    } catch {}
  };

  const handleFormChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <div className="jas-page">
      <header className="jas-header">
        <div className="jas-header-copy">
          <div className="jas-eyebrow">FOLLOW UPS • JAS'2026</div>
          <h1>Follow Ups JAS'2026</h1>
          <p>Follow-up schedule and requirement tracking</p>
        </div>

        <div className="jas-header-actions">
          <button
            className="jas-secondary-button"
            type="button"
            onClick={clearPageData}
          >
            Clear This Page
          </button>

          <button
            className="jas-primary-button"
            type="button"
            onClick={openCreate}
          >
            + Create Task
          </button>
        </div>
      </header>

      <section className="jas-stats">
        <div className="jas-stat-card">
          <div className="jas-stat-icon requirements">▤</div>
          <div className="jas-stat-content">
            <span>Total Requirements</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="jas-stat-card">
          <div className="jas-stat-icon served">✓</div>
          <div className="jas-stat-content">
            <span>Served</span>
            <strong>{stats.served}</strong>
          </div>
        </div>

        <div className="jas-stat-card">
          <div className="jas-stat-icon followup">↗</div>
          <div className="jas-stat-content">
            <span>Follow Up</span>
            <strong>{stats.followUps}</strong>
          </div>
        </div>

        <div className="jas-stat-card">
          <div className="jas-stat-icon evaluation">☎</div>
          <div className="jas-stat-content">
            <span>Evaluation Calls</span>
            <strong>{stats.evaluations}</strong>
          </div>
        </div>
      </section>

      <section className="jas-toolbar">
        <div className="jas-search-wrap">
          <span className="jas-search-icon">⌕</span>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search requirement, client, OPS, sales, trainer..."
          />
        </div>

        <div className="jas-result-count">
          Showing <strong>{filteredRows.length}</strong> of <strong>{localRows.length}</strong> requirements
        </div>
      </section>

      {showForm && (
        <div className="jas-modal-backdrop">
          <div className="jas-modal">
            <div className="jas-modal-header">
              <div>
                <div className="jas-eyebrow">
                  {editingId
                    ? "EDIT REQUIREMENT"
                    : "CREATE REQUIREMENT"}
                </div>

                <h2>
                  {editingId
                    ? "Edit Requirement"
                    : "Create Requirement"}
                </h2>
              </div>

              <button
                type="button"
                className="jas-modal-close"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
              >
                ✕
              </button>
            </div>

            <form
              className="jas-form"
              onSubmit={save}
            >
              <div className="jas-form-grid">
                <label>
                  <span>S.No.</span>
                  <input
                    value={form.sNo}
                    onChange={(event) =>
                      handleFormChange(
                        "sNo",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Client Proposal Shared Date</span>
                  <input
                    type="date"
                    value={form.clientProposalSharedDate}
                    onChange={(event) =>
                      handleFormChange(
                        "clientProposalSharedDate",
                        event.target.value
                      )
                    }
                    required
                  />
                </label>

                <label>
                  <span>Client Proposal Shared Time</span>
                  <input
                    type="time"
                    value={form.clientProposalSharedTime}
                    onChange={(event) =>
                      handleFormChange(
                        "clientProposalSharedTime",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="jas-form-full">
                  <span>Requirement Name</span>
                  <textarea
                    value={form.requirementName}
                    onChange={(event) =>
                      handleFormChange(
                        "requirementName",
                        event.target.value
                      )
                    }
                    required
                  />
                </label>

                <label>
                  <span>Assigned OPS Person</span>
                  <select
                    value={form.assignedOpsPerson}
                    onChange={(event) =>
                      handleFormChange(
                        "assignedOpsPerson",
                        event.target.value
                      )
                    }
                  >
                    <option value="">Select OPS</option>
                    {OPS_PERSONS.map((person) => (
                      <option
                        key={person}
                        value={person}
                      >
                        {person}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Sales Person</span>
                  <select
                    value={form.salesPerson}
                    onChange={(event) =>
                      handleFormChange(
                        "salesPerson",
                        event.target.value
                      )
                    }
                  >
                    <option value="">Select Sales</option>
                    {SALES_PERSONS.map((person) => (
                      <option
                        key={person}
                        value={person}
                      >
                        {person}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Client Name</span>
                  <input
                    value={form.clientName}
                    onChange={(event) =>
                      handleFormChange(
                        "clientName",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Requirement Status</span>
                  <select
                    value={form.requirementStatus}
                    onChange={(event) =>
                      handleFormChange(
                        "requirementStatus",
                        event.target.value
                      )
                    }
                  >
                    <option value="">Select Status</option>
                    {REQUIREMENT_STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  <span>Trainer Name</span>
                  <input
                    value={form.trainerName}
                    onChange={(event) =>
                      handleFormChange(
                        "trainerName",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Trainer Contact Details
                  </span>
                  <input
                    value={
                      form.trainerContactDetails
                    }
                    onChange={(event) =>
                      handleFormChange(
                        "trainerContactDetails",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Evaluation Call Status</span>
                  <select
                    value={form.evaluationCallStatus}
                    onChange={(event) =>
                      handleFormChange(
                        "evaluationCallStatus",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Evaluation
                    </option>

                    {EVALUATION_STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>

              <div className="jas-form-actions">
                <button
                  type="button"
                  className="jas-secondary-button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(EMPTY_FORM);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="jas-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Requirement"
                    : "Create Requirement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="jas-table-card">
        <div className="jas-table-scroll">
          <table className="jas-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Client Proposal<br />Shared Date</th>
                <th>Client Proposal<br />Shared Time</th>
                <th>Requirement Name</th>
                <th>Assigned OPS<br />Person</th>
                <th>Sales Person</th>
                <th>Client Name</th>
                <th>Requirement<br />Status</th>
                <th>Trainer Name</th>
                <th>Trainer Contact<br />Details</th>
                <th>Evaluation Call<br />Status</th>
                <th>Follow Up 1</th>
                <th>Follow Up 2</th>
                <th>Follow Up 3</th>
                <th>Follow Up 4</th>
                <th>Follow Up 5</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row, displayIndex) => {
                const schedule = followUpSchedule(
                  row.clientProposalSharedDate,
                  row.clientName
                );

                return (
                  <tr key={row.id ?? row.sNo}>
                    <td>
                      <span className="jas-sno-badge">
                        {displayIndex + 1}
                      </span>
                    </td>

                    <td>
                      {formatDate(
                        row.clientProposalSharedDate
                      )}
                    </td>

                    <td>
                      {formatTime(
                        row.clientProposalSharedTime
                      )}
                    </td>

                    <td className="jas-requirement-cell">
                      {row.requirementName || "—"}
                    </td>

                    <td>
                      {row.assignedOpsPerson || "—"}
                    </td>

                    <td>
                      {row.salesPerson || "—"}
                    </td>

                    <td>
                      {row.clientName || "—"}
                    </td>

                    <td>
                      <span
                        className={`jas-status jas-status-${String(
                          row.requirementStatus || ""
                        ).toLowerCase()}`}
                      >
                        {row.requirementStatus || "—"}
                      </span>
                    </td>

                    <td>
                      {row.trainerName || "—"}
                    </td>

                    <td>
                      {row.trainerContactDetails ||
                        "—"}
                    </td>

                    <td>
                      {row.evaluationCallStatus ||
                        "—"}
                    </td>

                    {schedule.map((item) => {
                      const key = `${row.id ?? row.sNo}-followup-${item.number}`;
                      const decisionValue = decisionMap[key];
                      return (
                        <td className="jas-followup-cell" key={item.number}>
                          <div className="jas-followup-date">{formatDate(item.date)}</div>
                          <div className="jas-followup-actions">
                            <button type="button" className={`jas-decision-button accepted ${decisionValue === "Accepted" ? "selected" : ""}`} onClick={() => decision(row, item.number, "Accepted")}>Accept</button>
                            <button type="button" className={`jas-decision-button declined ${decisionValue === "Declined" ? "selected" : ""}`} onClick={() => decision(row, item.number, "Declined")}>Decline</button>
                          </div>
                          {decisionValue && (
                            <div className={`jas-decision-value ${decisionValue.toLowerCase()}`}>{decisionValue}</div>
                          )}
                        </td>
                      );
                    })}

                    <td>
                      <div className="jas-row-actions">
                        <button
                          type="button"
                          className="jas-action-edit"
                          onClick={() =>
                            openEdit(row)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="jas-action-delete"
                          onClick={() =>
                            remove(row)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!filteredRows.length && (
                <tr>
                  <td
                    colSpan="17"
                    className="jas-empty"
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default FollowUpsJAS2026;