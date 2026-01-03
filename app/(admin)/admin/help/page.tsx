"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Camera,
  List,
  CheckCircle2,
  X,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const helpSections = [
  {
    id: "getting-started",
    title: "Getting Started",
  },
  {
    id: "qr-scanner",
    title: "QR Scanner",
  },
  {
    id: "members",
    title: "Members Management",
  },
  {
    id: "dashboard",
    title: "Dashboard & Analytics",
  },
  {
    id: "events",
    title: "Events Management",
  },
  {
    id: "activities",
    title: "Activities",
  },
  {
    id: "reports",
    title: "Reports",
  },
  {
    id: "finance",
    title: "Financials",
  },
];

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
            Help & Tutorials
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Step-by-step guides to help you use all features of the system
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {helpSections.map((section) => {
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "outline"}
                className="h-auto py-4"
                onClick={() => scrollToSection(section.id)}
              >
                <span className="text-xs md:text-sm font-medium">
                  {section.title}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Getting Started Section */}
        <Card id="getting-started" className="mb-6 scroll-mt-20">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Welcome! Let's learn the basics of using this system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What is this system?</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  This is a QR Code Attendance System for Jesus is Lord Luna La
                  Union. It helps you track member attendance at events, manage
                  member information, and generate reports.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Three Main Areas:</h3>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-1">Scanner</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Scan QR codes to record attendance
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-1">Admin Dashboard</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Manage members, view reports, and analytics
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-1">Financials</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Track tithes, offerings, and pledges
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Scanner Tutorial */}
        <Card id="qr-scanner" className="mb-6 scroll-mt-20">
          <CardHeader>
            <CardTitle>QR Scanner - How to Scan Attendance</CardTitle>
            <CardDescription>
              Learn how to use the QR scanner to record member attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="scanner-login">
                <AccordionTrigger>
                  Step 1: Accessing the Scanner
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">1</Badge>
                      <div>
                        <p className="font-medium">Go to the Home Page</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Open your browser and navigate to the system homepage
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">2</Badge>
                      <div>
                        <p className="font-medium">Click on "Scanner" Card</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          You'll see a card with a QR code icon - click on it
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">3</Badge>
                      <div>
                        <p className="font-medium">Login</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Enter your scanner username and password provided by
                          your administrator
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="scanner-activate">
                <AccordionTrigger>Step 2: Activating an Event</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">⚠️ Important:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        An event must be activated before you can scan
                        attendance. Only administrators can activate events.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">1</Badge>
                      <div>
                        <p className="font-medium">Check Event Status</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          At the top of the scanner page, you'll see which event
                          is currently active
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">2</Badge>
                      <div>
                        <p className="font-medium">If No Event is Active</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Contact an administrator to activate an event (Worship
                          Service, Life Group, etc.)
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="scanner-scanning">
                <AccordionTrigger>Step 3: Scanning QR Codes</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">1</Badge>
                      <div>
                        <p className="font-medium">
                          Click "Start Scanning" Button
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          This will turn on your device's camera
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">2</Badge>
                      <div>
                        <p className="font-medium">Allow Camera Permission</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Your browser will ask for camera permission - click
                          "Allow"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">3</Badge>
                      <div>
                        <p className="font-medium">Point Camera at QR Code</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Hold the member's QR code in front of the camera. Make
                          sure it's well-lit and in focus
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">4</Badge>
                      <div>
                        <p className="font-medium">Wait for Success Message</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          You'll hear a sound and see a green message saying
                          "Attendance Recorded!"
                        </p>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-medium">
                          Success Indicators:
                        </p>
                      </div>
                      <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
                        <li>Green success message appears</li>
                        <li>Success sound plays</li>
                        <li>Member's name appears in the scanned list</li>
                        <li>Count increases in the top right</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <X className="w-4 h-4 text-red-600" />
                        <p className="text-sm font-medium">Error Messages:</p>
                      </div>
                      <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
                        <li>
                          <strong>"Member Not Registered"</strong> - The QR code
                          is not in the system. Contact admin to register the
                          member first.
                        </li>
                        <li>
                          <strong>"Already Scanned"</strong> - This member was
                          already scanned for this event today
                        </li>
                        <li>
                          <strong>"No active event"</strong> - Ask an
                          administrator to activate an event
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="scanner-features">
                <AccordionTrigger>Step 4: Scanner Features</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <List className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold">
                          View Scanned Attendees
                        </h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Click the list icon (with the green badge showing count)
                        in the top right to see all scanned attendees
                      </p>
                      <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
                        <li>See member names and IDs</li>
                        <li>View scan time</li>
                        <li>Scroll through the list</li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className="w-5 h-5 text-purple-500" />
                        <h4 className="font-semibold">Switch Camera</h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Click the camera icon to switch between front and back
                        camera (useful for tablets/phones)
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="w-5 h-5 text-gray-500" />
                        <h4 className="font-semibold">Stop Scanning</h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Click "Stop Scanning" to turn off the camera. Click
                        "Start Scanning" again to resume
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Members Management Tutorial */}
        <Card id="members" className="mb-6 scroll-mt-20">
          <CardHeader>
            <CardTitle>Members Management - Complete Guide</CardTitle>
            <CardDescription>
              Learn how to add, edit, search, and manage member information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="members-add">
                <AccordionTrigger>Adding a New Member</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">1</Badge>
                      <div>
                        <p className="font-medium">Go to Members Page</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          From the Admin Dashboard sidebar, click on "Members"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">2</Badge>
                      <div>
                        <p className="font-medium">Click "Add Member" Button</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Look for the button with a "+" icon or "Add Member"
                          text at the top of the page
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">3</Badge>
                      <div>
                        <p className="font-medium">
                          Fill in Member Information
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          A form will appear. Fill in the required fields:
                        </p>
                        <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1 ml-4">
                          <li>
                            <strong>First Name</strong> - Member's first name
                            (required)
                          </li>
                          <li>
                            <strong>Last Name</strong> - Member's last name
                            (required)
                          </li>
                          <li>
                            <strong>Member ID</strong> - Auto-generated, but you
                            can change it
                          </li>
                          <li>
                            <strong>Date of Birth</strong> - Click the calendar
                            to select
                          </li>
                          <li>
                            <strong>Gender</strong> - Select from dropdown
                          </li>
                          <li>
                            <strong>Membership Type</strong> - Regular, Visitor,
                            etc.
                          </li>
                          <li>
                            <strong>Classification</strong> - Adult, Youth,
                            Child, etc.
                          </li>
                          <li>
                            <strong>Contact Information</strong> - Phone, email,
                            address
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">4</Badge>
                      <div>
                        <p className="font-medium">Save the Member</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Click "Save" or "Register" button. You'll see a
                          success message and a QR code will be generated
                          automatically
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="members-edit">
                <AccordionTrigger>Editing Member Information</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">1</Badge>
                      <div>
                        <p className="font-medium">Find the Member</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Use the search function or scroll through the members
                          table to find the member you want to edit
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">2</Badge>
                      <div>
                        <p className="font-medium">Click on the Member Row</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Click anywhere on the member's row in the table to
                          open the edit dialog
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">3</Badge>
                      <div>
                        <p className="font-medium">Update Information</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Change any fields you need to update. The Member ID
                          cannot be changed.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">4</Badge>
                      <div>
                        <p className="font-medium">Save Changes</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Click "Update" to save your changes. You'll see a
                          confirmation message
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="members-search">
                <AccordionTrigger>Searching for Members</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">1</Badge>
                      <div>
                        <p className="font-medium">Click Search Icon</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Look for the search icon (magnifying glass) in the top
                          toolbar
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">2</Badge>
                      <div>
                        <p className="font-medium">Enter Search Terms</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Type the member's name, ID, or any part of their
                          information in the search box
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">3</Badge>
                      <div>
                        <p className="font-medium">View Results</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Matching members will appear in the results. Click on
                          a result to view or edit
                        </p>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-4">
                      <p className="text-sm font-medium mb-1">💡 Tip:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        You can also use the filter options at the top of the
                        members table to filter by segment, membership type, or
                        date added
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="members-import">
                <AccordionTrigger>Importing Members from CSV</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-1">
                        ⚠️ Before You Start:
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Make sure your CSV file has the correct format. Required
                        columns: First Name, Last Name, Date of Birth, Gender,
                        Membership Type, Classification
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">1</Badge>
                      <div>
                        <p className="font-medium">Prepare Your CSV File</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Open Excel or Google Sheets and create a file with
                          member information. Save it as a CSV file (.csv
                          format)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">2</Badge>
                      <div>
                        <p className="font-medium">Click "Import CSV" Button</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Look for the upload icon or "Import" button in the
                          members page toolbar
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">3</Badge>
                      <div>
                        <p className="font-medium">Select Your File</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Click "Choose File" and select your CSV file from your
                          computer
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">4</Badge>
                      <div>
                        <p className="font-medium">Review and Confirm</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          The system will show you a preview of the data. Review
                          it carefully, then click "Import" to add all members
                        </p>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-4">
                      <p className="text-sm font-medium mb-1">
                        ✅ After Import:
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        All imported members will have QR codes generated
                        automatically. You can print them using the Print
                        function
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="members-export">
                <AccordionTrigger>Exporting Members to CSV</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">1</Badge>
                      <div>
                        <p className="font-medium">Apply Filters (Optional)</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          If you want to export only specific members, use the
                          filters first (by segment, date added, etc.)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">2</Badge>
                      <div>
                        <p className="font-medium">Click "Export" Button</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Look for the download icon or "Export" button in the
                          toolbar
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">3</Badge>
                      <div>
                        <p className="font-medium">Download the File</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          The CSV file will download automatically. Open it in
                          Excel or Google Sheets to view
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="members-print">
                <AccordionTrigger>Printing Member QR Codes</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">1</Badge>
                      <div>
                        <p className="font-medium">Select Members to Print</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Option A: Select specific members by checking the
                          boxes next to their names
                          <br />
                          Option B: Use filters to select a group (e.g., all
                          Youth members)
                          <br />
                          Option C: Click "Print All" to print all members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">2</Badge>
                      <div>
                        <p className="font-medium">Click "Print" Button</p>
                        <p className="text-slate-600 dark:text-slate-400">
                          Look for the printer icon in the toolbar
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">3</Badge>
                      <div>
                        <p className="font-medium">Review Print Preview</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          A preview will show how the QR codes will look. Each
                          page shows multiple QR codes with member names
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">4</Badge>
                      <div>
                        <p className="font-medium">Print</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Click the print button in your browser or press Ctrl+P
                          (Windows) / Cmd+P (Mac). Make sure to select the
                          correct printer
                        </p>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-4">
                      <p className="text-sm font-medium mb-1">
                        💡 Printing Tips:
                      </p>
                      <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
                        <li>Use A4 or Letter size paper</li>
                        <li>
                          Make sure "Background graphics" is enabled in print
                          settings
                        </li>
                        <li>Test print one page first to check quality</li>
                        <li>
                          Cut along the dotted lines to separate each QR code
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="members-delete">
                <AccordionTrigger>Deleting a Member</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-1">⚠️ Warning:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Deleting a member will permanently remove all their
                        information and attendance records. This action cannot
                        be undone. Only delete if absolutely necessary.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">1</Badge>
                      <div>
                        <p className="font-medium">Find the Member</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Search for or locate the member in the members table
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">2</Badge>
                      <div>
                        <p className="font-medium">Click Delete Button</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Look for the delete/trash icon in the member's row
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">3</Badge>
                      <div>
                        <p className="font-medium">Confirm Deletion</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          A confirmation dialog will appear. Type "DELETE" to
                          confirm and click "Delete"
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Dashboard Tutorial */}
        <Card id="dashboard" className="mb-6 scroll-mt-20">
          <CardHeader>
            <CardTitle>Dashboard & Analytics</CardTitle>
            <CardDescription>
              Understanding your attendance data and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Key Metrics Cards</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  At the top of the dashboard, you'll see several cards showing
                  important numbers:
                </p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
                  <li>
                    <strong>Today's Attendance</strong> - Number of people
                    scanned today
                  </li>
                  <li>
                    <strong>Total Attendance</strong> - All-time attendance
                    count
                  </li>
                  <li>
                    <strong>Unique Attendees</strong> - Number of different
                    people who have attended
                  </li>
                  <li>
                    <strong>New Members</strong> - Members added recently
                  </li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Attendance Chart</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  The chart shows attendance trends over time. You can:
                </p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
                  <li>Hover over data points to see exact numbers</li>
                  <li>View attendance by different time periods</li>
                  <li>See which events have the most attendance</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Age Category Breakdown</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  This section shows how many attendees fall into each age
                  category (Child, Youth, Adult, Senior). This helps you
                  understand your congregation demographics.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">
                  Recent Attendance Records
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Scroll down to see a table of recent attendance. You can:
                </p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
                  <li>See who attended and when</li>
                  <li>Filter by event type</li>
                  <li>Use pagination to see more records</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Tutorial */}
        <Card id="events" className="mb-6 scroll-mt-20">
          <CardHeader>
            <CardTitle>Events Management</CardTitle>
            <CardDescription>
              How to activate and manage events for attendance tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What are Events?</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Events are different types of gatherings where you track
                  attendance. Examples: Worship Service, Life Group, Night of
                  Power, Youth Zone.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Activating an Event</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Step 1:</strong> Go to the Attendance page from the
                    sidebar
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Step 2:</strong> You'll see cards for each event
                    type
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Step 3:</strong> Click the "Activate" button on the
                    event you want to use
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Step 4:</strong> Only one event can be active at a
                    time. Activating a new event will automatically deactivate
                    the previous one
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Deactivating an Event</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  When an event is finished, click the "Deactivate" button on
                  the active event card. This stops new scans from being
                  recorded for that event.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-sm font-medium mb-1">⚠️ Important Notes:</p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
                  <li>Scanners can only scan when an event is active</li>
                  <li>Each event tracks attendance separately</li>
                  <li>You can view attendance reports for each event</li>
                  <li>
                    Deactivating an event doesn't delete the attendance records
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities Tutorial */}
        <Card id="activities" className="mb-6 scroll-mt-20">
          <CardHeader>
            <CardTitle>Activities Management</CardTitle>
            <CardDescription>
              Tracking special activities and services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The Activities section allows you to track special events and
                services beyond regular attendance:
              </p>
              <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-2">
                <li>
                  <strong>Life Group</strong> - Track attendance at life group
                  meetings
                </li>
                <li>
                  <strong>iCare</strong> - Record iCare program participation
                </li>
                <li>
                  <strong>Water Baptism</strong> - Track baptism events
                </li>
                <li>
                  <strong>House Blessings</strong> - Record house blessing
                  services
                </li>
                <li>
                  <strong>Necro Services</strong> - Track funeral/memorial
                  services
                </li>
                <li>
                  <strong>Non JIL Related</strong> - Other activities and events
                </li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
                <p className="text-sm font-medium mb-1">💡 How to Use:</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Each activity type has its own page. Navigate to the activity
                  from the sidebar, then add, view, or manage records similar to
                  how you manage members.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Tutorial */}
        <Card id="reports" className="mb-6 scroll-mt-20">
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              Generating and viewing attendance reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Viewing Reports</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Go to the Reports page from the sidebar. You can:
                </p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
                  <li>View attendance by age group</li>
                  <li>See attendance trends over time</li>
                  <li>Filter reports by event type</li>
                  <li>Export reports for record-keeping</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Age Group Reports</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Click on an age group (Child, Youth, Adult, Senior) to see
                  detailed attendance information for that demographic.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finance Tutorial */}
        <Card id="finance" className="mb-6 scroll-mt-20">
          <CardHeader>
            <CardTitle>Financials</CardTitle>
            <CardDescription>
              Managing tithes, offerings, and pledges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm font-medium mb-1">
                  Accessing Financials:
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Financial features are in a separate section. Go to the home
                  page and click on the "Financials" card, then login with your
                  finance credentials.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Three Main Areas:</h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <li>
                    <strong>Tithes</strong> - Record and track member tithes
                  </li>
                  <li>
                    <strong>Offerings</strong> - Track special offerings and
                    donations
                  </li>
                  <li>
                    <strong>Pledges</strong> - Manage financial pledges and
                    commitments
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-sm font-medium mb-1">⚠️ Note:</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Financial features require special permissions. Contact your
                  administrator if you need access to this section.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              Troubleshooting Common Issues
            </CardTitle>
            <CardDescription>Solutions to common problems</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="camera-not-working">
                <AccordionTrigger>Camera Not Working</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Problem:</strong> Camera doesn't turn on when
                      scanning
                    </p>
                    <p>
                      <strong>Solutions:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>
                        Check if you allowed camera permission in your browser
                      </li>
                      <li>Make sure no other app is using the camera</li>
                      <li>Try refreshing the page</li>
                      <li>
                        Check if your device camera is working in other apps
                      </li>
                      <li>Try switching between front and back camera</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="qr-not-scanning">
                <AccordionTrigger>QR Code Not Scanning</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Problem:</strong> QR code is visible but not being
                      recognized
                    </p>
                    <p>
                      <strong>Solutions:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Make sure the QR code is well-lit and in focus</li>
                      <li>
                        Hold the camera steady and at the right distance (not
                        too close, not too far)
                      </li>
                      <li>Clean your camera lens</li>
                      <li>Make sure the QR code is not damaged or wrinkled</li>
                      <li>
                        Try printing a new QR code if the old one is faded
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="member-not-found">
                <AccordionTrigger>
                  "Member Not Registered" Error
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Problem:</strong> System says member is not
                      registered
                    </p>
                    <p>
                      <strong>Solutions:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>The member needs to be added to the system first</li>
                      <li>Go to Members page and add the member</li>
                      <li>Print a new QR code for the member</li>
                      <li>
                        Make sure you're using the correct QR code (not an old
                        one)
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="cant-login">
                <AccordionTrigger>Can't Login</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Problem:</strong> Login credentials not working
                    </p>
                    <p>
                      <strong>Solutions:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>
                        Double-check your username and password (case-sensitive)
                      </li>
                      <li>Make sure Caps Lock is not on</li>
                      <li>Contact your administrator to reset your password</li>
                      <li>
                        Make sure you're using the correct login page (Scanner,
                        Admin, or Finance)
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="slow-loading">
                <AccordionTrigger>Page Loading Slowly</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Problem:</strong> Pages take a long time to load
                    </p>
                    <p>
                      <strong>Solutions:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Check your internet connection</li>
                      <li>Close other browser tabs to free up memory</li>
                      <li>Try refreshing the page</li>
                      <li>Clear your browser cache if problems persist</li>
                      <li>Contact IT support if the issue continues</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>
              If you're still having trouble, don't hesitate to reach out
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg text-center">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                For technical support or questions about using the system,
                please contact:
              </p>
              <div className="space-y-2">
                <p className="font-semibold">System Administrator</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Developed and maintained by <strong>Paolo P. Espero</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
