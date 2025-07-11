"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Clock, 
  Building2, 
  Users, 
  GraduationCap, 
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  User,
  Award,
  BookOpen,
  Target,
  FileText
} from "lucide-react"
import { TrainingLevelBadge } from "@/components/TrainingLevelBadge"
import { calculateCompletionRate } from "@/utils/trainingUtils"
import StatsCard from "@/components/StatsCard"

// Training Detail Interface
export interface TrainingDetail {
  id: number
  name: string
  institution: string
  duration: string
  level: string
  enrolled: number
  completed: number
  description: string
  fullDescription: string
  prerequisites: string[]
  learningObjectives: string[]
  courseOutline: {
    module: string
    duration: string
    topics: string[]
  }[]
  instructor: {
    name: string
    credentials: string
    experience: string
    image: string
  }
  schedule: {
    startDate: string
    endDate: string
    format: string
    location: string
  }
  pricing: {
    amount: number
    currency: string
    includes: string[]
  }

}

// Training Details Data
export const trainingDetails: Record<number, TrainingDetail> = {
  1: {
    id: 1,
    name: "Part 107 Remote Pilot Certificate",
    institution: "FAA",
    duration: "40 hours",
    level: "L1",
    enrolled: 12,
    completed: 45,
    description: "Basic commercial drone operation certification required by FAA",
    fullDescription:
      "The Part 107 Remote Pilot Certificate is the foundational certification required by the Federal Aviation Administration (FAA) for commercial drone operations in the United States. This comprehensive course covers all aspects of safe and legal drone operation, including airspace regulations, weather interpretation, aircraft performance, and emergency procedures.",
    prerequisites: [
      "Must be at least 16 years old",
      "Able to read, speak, write, and understand English",
      "Be in a physical and mental condition to safely operate a small UAS",
    ],
    learningObjectives: [
      "Understand FAA regulations for small unmanned aircraft systems",
      "Interpret sectional charts and airspace classifications",
      "Analyze weather conditions for safe flight operations",
      "Calculate aircraft performance and loading",
      "Implement emergency procedures and risk management",
    ],
    courseOutline: [
      {
        module: "Regulations and Airspace",
        duration: "12 hours",
        topics: [
          "Part 107 regulations",
          "Airspace classifications",
          "NOTAM interpretation",
          "Waivers and authorizations",
        ],
      },
      {
        module: "Weather and Performance",
        duration: "10 hours",
        topics: ["Weather theory", "METAR/TAF interpretation", "Aircraft performance", "Weight and balance"],
      },
      {
        module: "Operations and Safety",
        duration: "10 hours",
        topics: ["Crew resource management", "Risk assessment", "Emergency procedures", "Maintenance requirements"],
      },
      {
        module: "Exam Preparation",
        duration: "8 hours",
        topics: ["Practice tests", "Review sessions", "Test-taking strategies", "Final assessment"],
      },
    ],
    instructor: {
      name: "Captain Sarah Mitchell",
      credentials: "ATP, CFII, Part 107 DPE",
      experience: "15+ years aviation experience, Former airline pilot, FAA Designated Pilot Examiner",
      image: "/placeholder.svg?height=100&width=100",
    },
    schedule: {
      startDate: "2024-02-15",
      endDate: "2024-03-15",
      format: "Hybrid (Online + In-person)",
      location: "Training Center - Dallas, TX",
    },
    pricing: {
      amount: 599,
      currency: "INR",
      includes: ["Course materials", "Practice exams", "Exam voucher", "Certificate upon completion"],
    },

  },
  2: {
    id: 2,
    name: "Advanced Flight Operations",
    institution: "DJI Academy",
    duration: "80 hours",
    level: "L2",
    enrolled: 8,
    completed: 23,
    description: "Advanced piloting techniques and complex mission planning",
    fullDescription:
      "This advanced course builds upon basic piloting skills to cover complex flight operations, advanced mission planning, and specialized flight techniques. Students will learn to operate in challenging environments and execute complex missions with precision and safety.",
    prerequisites: [
      "Valid Part 107 Remote Pilot Certificate",
      "Minimum 50 hours logged flight time",
      "Basic understanding of drone systems and operations",
    ],
    learningObjectives: [
      "Master advanced flight maneuvers and techniques",
      "Plan and execute complex multi-phase missions",
      "Operate safely in challenging weather conditions",
      "Implement advanced safety protocols and risk mitigation",
      "Utilize advanced flight planning software and tools",
    ],
    courseOutline: [
      {
        module: "Advanced Flight Techniques",
        duration: "20 hours",
        topics: ["Precision flying", "Advanced maneuvers", "Formation flying", "Night operations"],
      },
      {
        module: "Mission Planning",
        duration: "20 hours",
        topics: ["Complex mission design", "Multi-aircraft coordination", "Contingency planning", "Risk assessment"],
      },
      {
        module: "Environmental Operations",
        duration: "20 hours",
        topics: ["Weather flying", "Urban operations", "Mountain flying", "Maritime operations"],
      },
      {
        module: "Practical Applications",
        duration: "20 hours",
        topics: ["Real-world scenarios", "Emergency procedures", "Equipment failures", "Final evaluation"],
      },
    ],
    instructor: {
      name: "Commander Alex Rodriguez",
      credentials: "Military UAS Pilot, DJI Master Instructor",
      experience: "20+ years military aviation, 10+ years drone operations, International training experience",
      image: "/placeholder.svg?height=100&width=100",
    },
    schedule: {
      startDate: "2024-03-01",
      endDate: "2024-04-30",
      format: "In-person intensive",
      location: "DJI Training Facility - Los Angeles, CA",
    },
    pricing: {
      amount: 1299,
      currency: "INR",
      includes: [
        "Advanced flight simulator access",
        "Professional flight planning software",
        "Equipment usage",
        "Certification",
      ],
    },

  },
  5: {
    id: 5,
    name: "Basic Drone Maintenance",
    institution: "Drone Tech Institute",
    duration: "60 hours",
    level: "L1",
    enrolled: 15,
    completed: 32,
    description: "Fundamental maintenance and repair procedures",
    fullDescription:
      "This comprehensive maintenance course provides hands-on training in drone system maintenance, troubleshooting, and repair. Students will learn to diagnose common issues, perform routine maintenance, and execute basic repairs on various drone platforms.",
    prerequisites: [
      "Basic mechanical aptitude",
      "High school diploma or equivalent",
      "No prior drone experience required",
    ],
    learningObjectives: [
      "Understand drone system components and their functions",
      "Perform routine maintenance and inspections",
      "Diagnose common mechanical and electrical issues",
      "Execute basic repairs and component replacements",
      "Maintain detailed maintenance logs and records",
    ],
    courseOutline: [
      {
        module: "Drone Systems Overview",
        duration: "15 hours",
        topics: ["Frame and structure", "Propulsion systems", "Flight control systems", "Power systems"],
      },
      {
        module: "Maintenance Procedures",
        duration: "20 hours",
        topics: ["Pre-flight inspections", "Routine maintenance", "Cleaning procedures", "Storage protocols"],
      },
      {
        module: "Troubleshooting and Repair",
        duration: "20 hours",
        topics: ["Diagnostic techniques", "Component testing", "Basic repairs", "Parts replacement"],
      },
      {
        module: "Documentation and Quality",
        duration: "5 hours",
        topics: ["Maintenance logs", "Quality control", "Safety protocols", "Certification requirements"],
      },
    ],
    instructor: {
      name: "Master Technician Robert Kim",
      credentials: "A&P Mechanic, Drone Maintenance Specialist",
      experience: "25+ years aircraft maintenance, 8+ years drone systems, FAA certified",
      image: "/placeholder.svg?height=100&width=100",
    },
    schedule: {
      startDate: "2024-02-20",
      endDate: "2024-03-25",
      format: "Hands-on workshop",
      location: "Technical Training Center - Phoenix, AZ",
    },
    pricing: {
      amount: 899,
      currency: "INR",
      includes: ["Tool kit", "Maintenance manuals", "Practice drone", "Certification"],
    },

  },
}





export default function TrainingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")

  const trainingId = parseInt(id || "1")
  const training = trainingDetails[trainingId]

  if (!training) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Training Not Found</h1>
          <Button onClick={() => navigate("/training")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Training
          </Button>
        </div>
      </div>
    )
  }

  const completionRate = calculateCompletionRate(training.enrolled, training.completed)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/training")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Training
          </Button>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{training.name}</h1>
                <p className="text-lg text-gray-600 mb-4">{training.fullDescription}</p>
                <div className="flex items-center space-x-4">
                  <TrainingLevelBadge level={training.level} />
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{training.institution}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{training.duration}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {training.pricing.currency} {training.pricing.amount}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <StatsCard
                icon={<Users className="h-5 w-5 text-blue-500" />}
                label="Currently Enrolled"
                value={training.enrolled}
                bgClass="bg-blue-50"
              />
              <StatsCard
                icon={<GraduationCap className="h-5 w-5 text-green-500" />}
                label="Completed"
                value={training.completed}
                bgClass="bg-green-50"
              />
              <StatsCard
                icon={<Calendar className="h-5 w-5 text-purple-500" />}
                label="Start Date"
                value={new Date(training.schedule.startDate).toLocaleDateString()}
                bgClass="bg-purple-50"
              />
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-medium">{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 gap-4">
            <TabsTrigger value="overview" className="text-sm font-medium">
              Overview
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="text-sm font-medium">
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="instructor" className="text-sm font-medium">
              Instructor
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-sm font-medium">
              Schedule
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Prerequisites */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Prerequisites</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {training.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Learning Objectives */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Learning Objectives</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {training.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Pricing Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Pricing & What's Included</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-2xl font-bold text-blue-600 mb-2">
                        {training.pricing.currency} {training.pricing.amount}
                      </h3>
                      <p className="text-gray-600 mb-4">One-time payment</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">What's Included:</h4>
                      <ul className="space-y-1">
                        {training.pricing.includes.map((item, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum">
            <div className="space-y-6">
              {training.courseOutline.map((module, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Module {index + 1}: {module.module}</span>
                      </span>
                      <Badge variant="outline">{module.duration}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {module.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Instructor Tab */}
          <TabsContent value="instructor">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <img
                    src={training.instructor.image}
                    alt={training.instructor.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{training.instructor.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{training.instructor.credentials}</p>
                    <p className="text-gray-600 mb-4">{training.instructor.experience}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">Certified Instructor</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Expert Level</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Course Schedule</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">
                      {new Date(training.schedule.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium">
                      {new Date(training.schedule.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">{training.schedule.format}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Location</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">{training.schedule.location}</p>
                  <p className="text-gray-600 mt-2">
                    All training materials and equipment will be provided on-site.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


        </Tabs>
      </div>
    </div>
  )
}
