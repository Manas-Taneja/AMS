"use client"

import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BaseLayout } from "@/components/BaseLayout"
import { SearchFilterTabs } from "@/components/SearchFilterTabs"
import { TrainingStatsCard } from "@/components/TrainingStatsCard"
import { TrainingLevelBadge } from "@/components/TrainingLevelBadge"
import { UnifiedHeader } from "@/components/UnifiedHeader"
import { GraduationCap } from "lucide-react"
import { containerVariants, cardVariants, itemVariants } from "@/utils/animations"

// Mock data for different job titles and their certifications
const trainingData = {
  "drone-pilot": {
    title: "Drone Pilot",
    certifications: [
      {
        id: 1,
        name: "Part 107 Remote Pilot Certificate",
        institution: "FAA",
        duration: "40 hours",
        level: "L1",
        enrolled: 12,
        completed: 45,
        description: "Basic commercial drone operation certification required by FAA",
      },
      {
        id: 2,
        name: "Advanced Flight Operations",
        institution: "DJI Academy",
        duration: "80 hours",
        level: "L2",
        enrolled: 8,
        completed: 23,
        description: "Advanced piloting techniques and complex mission planning",
      },
      {
        id: 3,
        name: "Night Flight Certification",
        institution: "AUVSI",
        duration: "24 hours",
        level: "L2",
        enrolled: 5,
        completed: 18,
        description: "Specialized training for night and low-light operations",
      },
      {
        id: 4,
        name: "Instructor Pilot Certification",
        institution: "Professional Drone Academy",
        duration: "120 hours",
        level: "L3",
        enrolled: 3,
        completed: 7,
        description: "Qualification to train and certify other drone pilots",
      },
    ],
  },
  technician: {
    title: "Drone Technician",
    certifications: [
      {
        id: 5,
        name: "Basic Drone Maintenance",
        institution: "Drone Tech Institute",
        duration: "60 hours",
        level: "L1",
        enrolled: 15,
        completed: 32,
        description: "Fundamental maintenance and repair procedures",
      },
      {
        id: 6,
        name: "Advanced Avionics Repair",
        institution: "Aviation Technical College",
        duration: "100 hours",
        level: "L2",
        enrolled: 6,
        completed: 14,
        description: "Complex electronic systems diagnosis and repair",
      },
      {
        id: 7,
        name: "Propulsion Systems Specialist",
        institution: "UAV Technical Academy",
        duration: "80 hours",
        level: "L2",
        enrolled: 4,
        completed: 9,
        description: "Motor, ESC, and propeller systems expertise",
      },
      {
        id: 8,
        name: "Master Technician Certification",
        institution: "International Drone Association",
        duration: "200 hours",
        level: "L3",
        enrolled: 2,
        completed: 3,
        description: "Comprehensive technical expertise across all drone systems",
      },
    ],
  },
  inspector: {
    title: "Drone Inspector",
    certifications: [
      {
        id: 9,
        name: "Infrastructure Inspection Basics",
        institution: "Infrastructure Academy",
        duration: "50 hours",
        level: "L1",
        enrolled: 10,
        completed: 28,
        description: "Basic techniques for inspecting bridges, towers, and buildings",
      },
      {
        id: 10,
        name: "Thermal Imaging Certification",
        institution: "FLIR Training Center",
        duration: "40 hours",
        level: "L2",
        enrolled: 7,
        completed: 19,
        description: "Thermal camera operation and data interpretation",
      },
      {
        id: 11,
        name: "Power Line Inspection Specialist",
        institution: "Utility Drone Institute",
        duration: "70 hours",
        level: "L2",
        enrolled: 5,
        completed: 12,
        description: "Specialized training for electrical infrastructure inspection",
      },
      {
        id: 12,
        name: "Chief Inspector Certification",
        institution: "Professional Inspection Board",
        duration: "150 hours",
        level: "L3",
        enrolled: 1,
        completed: 4,
        description: "Leadership and quality assurance for inspection operations",
      },
    ],
  },
  analyst: {
    title: "Management",
    certifications: [
      {
        id: 13,
        name: "Drone Data Processing Fundamentals",
        institution: "GIS Academy",
        duration: "45 hours",
        level: "L1",
        enrolled: 9,
        completed: 25,
        description: "Basic photogrammetry and data processing techniques",
      },
      {
        id: 14,
        name: "Advanced Mapping & Surveying",
        institution: "Survey Tech Institute",
        duration: "90 hours",
        level: "L2",
        enrolled: 6,
        completed: 16,
        description: "Professional-grade mapping and surveying methodologies",
      },
      {
        id: 15,
        name: "AI-Powered Analytics",
        institution: "Tech Innovation Center",
        duration: "75 hours",
        level: "L2",
        enrolled: 4,
        completed: 8,
        description: "Machine learning applications for drone data analysis",
      },
      {
        id: 16,
        name: "Senior Data Scientist",
        institution: "Advanced Analytics Institute",
        duration: "180 hours",
        level: "L3",
        enrolled: 2,
        completed: 5,
        description: "Leadership in data science and analytics strategy",
      },
    ],
  },
}

export default function Training() {
  const [searchValue, setSearchValue] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [levelFilter, setLevelFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const navigate = useNavigate()

  // Flatten all certifications into a single array
  const allCertifications = useMemo(() => {
    return Object.values(trainingData).flatMap(data => data.certifications)
  }, [])

  // Filter certifications based on search and filters
  const filteredCertifications = useMemo(() => {
    return allCertifications.filter(cert => {
      const matchesSearch = cert.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                           cert.description.toLowerCase().includes(searchValue.toLowerCase()) ||
                           cert.institution.toLowerCase().includes(searchValue.toLowerCase())
      
      const matchesLevel = levelFilter === "all" || cert.level === levelFilter
      
      return matchesSearch && matchesLevel
    })
  }, [allCertifications, searchValue, levelFilter])

  // Group certifications by job title (owner)
  const groupedByOwner = useMemo(() => {
    const grouped: Record<string, typeof allCertifications> = {}
    Object.entries(trainingData).forEach(([, data]) => {
      grouped[data.title] = data.certifications.filter(cert => 
        filteredCertifications.some(fc => fc.id === cert.id)
      )
    })
    return grouped
  }, [filteredCertifications])

  const owners = Object.keys(trainingData).map(key => trainingData[key as keyof typeof trainingData].title)

  // Filter options
  const levelFilterOptions = [
    { value: "all", label: "All Levels" },
    { value: "L1", label: "Beginner (L1)" },
    { value: "L2", label: "Intermediate (L2)" },
    { value: "L3", label: "Advanced (L3)" },
  ]

  const filters = [
    {
      key: "level",
      label: "Level",
      value: levelFilter,
      options: levelFilterOptions,
      onValueChange: setLevelFilter,
    },
  ]

  // Render functions for SearchFilterTabs
  const renderGridItem = (cert: typeof allCertifications[0]) => (
    <motion.div
      key={cert.id}
      variants={cardVariants}
      initial="initial"
      animate="in"
      whileHover="hover"
    >
      <Card 
        className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={() => navigate(`/training/${cert.id}`)}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-2">
            <CardTitle className="text-lg font-semibold leading-tight">{cert.name}</CardTitle>
            <TrainingLevelBadge level={cert.level} className="ml-2" />
          </div>
          <CardDescription className="text-sm text-gray-600">{cert.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <TrainingStatsCard
            enrolled={cert.enrolled}
            completed={cert.completed}
            duration={cert.duration}
            institution={cert.institution}
          />
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderListItem = (cert: typeof allCertifications[0]) => (
    <motion.div
      key={cert.id}
      variants={itemVariants}
      initial="initial"
      animate="in"
    >
      <Card 
        className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={() => navigate(`/training/${cert.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">{cert.name}</h3>
                <TrainingLevelBadge level={cert.level} />
              </div>
              <p className="text-gray-600 mb-2">{cert.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{cert.institution}</span>
                <span>•</span>
                <span>{cert.duration}</span>
                <span>•</span>
                <span>{cert.enrolled + cert.completed} participants</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{cert.enrolled + cert.completed}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const handleClearFilters = () => {
    setSearchValue("")
    setLevelFilter("all")
  }

  const handleExport = () => {
    // Export functionality
    alert('Export training data clicked')
  }

  const handleAdd = () => {
    // Add new training course
    alert('Add new training course clicked')
  }

  return (
    <BaseLayout className="p-8">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Unified Header */}
          <UnifiedHeader
            title="Training & Certifications"
            subtitle="Comprehensive training programs and certifications for our operations team across all specializations"
            onAdd={handleAdd}
            addLabel="Add Course"
            onExport={handleExport}
            exportLabel="Export Training Data"
          />

          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="in"
          >
            <SearchFilterTabs
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              searchPlaceholder="Search training courses..."
              filters={filters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showViewToggle={true}
              owners={owners}
              groupedByOwner={groupedByOwner}
              renderGridItem={renderGridItem}
              renderListItem={renderListItem}
              emptyStateIcon={<GraduationCap className="h-12 w-12 text-gray-400" />}
              emptyStateTitle="No training courses found"
              emptyStateDescription="Try adjusting your search or filters to find the training you're looking for."
              gridCols="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4"
              className="w-full"
              totalCount={allCertifications.length}
              filteredCount={filteredCertifications.length}
              itemLabel="courses"
              onClearFilters={handleClearFilters}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              allItems={filteredCertifications}
            />
          </motion.div>
        </div>
      </div>
    </BaseLayout>
  )
}
