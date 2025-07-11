export type StaffListMember = {
  id: number;
  name: string;
  designation: string;
  skills: string[];
  location: string;
  availability: string;
  project: string;
  company: "PSSL" | "Prakhar Aviation" | "IIDT";
};

export const staffData: StaffListMember[] = [
  { id: 1, name: "Anurag", designation: "Project Associate(Drone)", skills: ["Drone Pilot", "Procurement"], location: "Malviya Nagar", availability: "Available", project: "FPV, FPV-2, FPV-3", company: "PSSL" },
  { id: 2, name: "Bob Smith", designation: "CTO", skills: ["Flight Control", "Telemetry"], location: "San Francisco", availability: "In Transit", project: "Autonomous Delivery", company: "Prakhar Aviation" },
  { id: 3, name: "Carol Lee", designation: "CFO", skills: ["Budgeting", "Vendor Management"], location: "Chicago", availability: "Available", project: "Fleet Expansion", company: "IIDT" },
  { id: 4, name: "David Kim", designation: "Engineering Manager", skills: ["Payload Integration", "FPV", "Drone Pilot"], location: "Remote", availability: "On Leave", project: "Disaster Response", company: "IIDT" },
  { id: 5, name: "Eva Brown", designation: "Lead Engineer", skills: ["Aerial Mapping", "Battery Management"], location: "Remote", availability: "Available", project: "Crop Monitoring", company: "PSSL" },
  { id: 6, name: "Frank Green", designation: "Accountant", skills: ["Cost Analysis", "Procurement"], location: "Chicago", availability: "Available", project: "Fleet Expansion", company: "IIDT" },
  { id: 7, name: "Grace White", designation: "Engineer", skills: ["FPV", "Telemetry"], location: "Remote", availability: "In Transit", project: "Aerial Survey", company: "Prakhar Aviation" },
  { id: 8, name: "Henry Black", designation: "Engineer", skills: ["Battery Management", "Flight Control"], location: "Remote", availability: "Available", project: "Crop Monitoring", company: "Prakhar Aviation" },
];

export const allDesignations = Array.from(new Set(staffData.map(item => item.designation)));
export const designationOptions = ["Select Designation", ...allDesignations];
export const availabilityOptions = ["Select Status", "Available", "In Transit", "On Leave"];
export const allSkills = Array.from(new Set(staffData.flatMap(item => item.skills)));
export const skillOptions = ["Select Skill", ...allSkills]; 