import { BaseLayout } from "../components/BaseLayout"
import { UnifiedHeader } from "../components/UnifiedHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GraduationCap, Clock, CheckCircle, AlertTriangle, Plus } from "lucide-react"

interface TrainingCertification {
  id: number
  name: string
  description: string
  status: "active" | "expired" | "pending" | "completed"
  expiryDate: string
  issuedDate: string
  category: string
  employee: string
}

const mockTrainingData: TrainingCertification[] = [
  {
    id: 1,
    name: "Safety Training Certification",
    description: "Workplace safety and emergency procedures",
    status: "active",
    expiryDate: "2024-12-31",
    issuedDate: "2024-01-15",
    category: "Safety",
    employee: "John Doe"
  },
  {
    id: 2,
    name: "Equipment Operation License",
    description: "Heavy machinery operation certification",
    status: "expired",
    expiryDate: "2024-03-15",
    issuedDate: "2023-03-15",
    category: "Equipment",
    employee: "Jane Smith"
  },
  {
    id: 3,
    name: "First Aid Certification",
    description: "Basic first aid and CPR training",
    status: "pending",
    expiryDate: "2025-06-30",
    issuedDate: "2024-06-15",
    category: "Health",
    employee: "Mike Johnson"
  },
  {
    id: 4,
    name: "Data Security Training",
    description: "Information security and data protection",
    status: "completed",
    expiryDate: "2024-08-20",
    issuedDate: "2024-02-20",
    category: "IT",
    employee: "Sarah Wilson"
  }
]

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        color: "bg-green-100 text-green-800",
        label: "Active"
      }
    case "expired":
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        color: "bg-red-100 text-red-800",
        label: "Expired"
      }
    case "pending":
      return {
        icon: <Clock className="h-4 w-4" />,
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending"
      }
    case "completed":
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        color: "bg-blue-100 text-blue-800",
        label: "Completed"
      }
    default:
      return {
        icon: <Clock className="h-4 w-4" />,
        color: "bg-gray-100 text-gray-800",
        label: "Unknown"
      }
  }
}

export default function Training() {
  const handleAdd = () => alert("Add Training Certification clicked")
  const handleExport = () => alert("Export Training Data clicked")

  return (
    <BaseLayout className="p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        <UnifiedHeader
          title="Training & Certifications"
          subtitle="Manage employee training and certification records"
          onAdd={handleAdd}
          onExport={handleExport}
          addLabel="Add Certification"
          exportLabel="Export Data"
          totalCount={mockTrainingData.length}
          itemLabel="certifications"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTrainingData.map((cert) => {
            const statusConfig = getStatusConfig(cert.status)
            const isExpired = new Date(cert.expiryDate) < new Date()
            
            return (
              <Card key={cert.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{cert.name}</CardTitle>
                    </div>
                    <Badge className={statusConfig.color}>
                      {statusConfig.icon} {statusConfig.label}
                    </Badge>
                  </div>
                  <CardDescription>{cert.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Employee</p>
                      <p className="font-medium">{cert.employee}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">{cert.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Issued</p>
                      <p className="font-medium">
                        {new Date(cert.issuedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expires</p>
                      <p className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
                        {new Date(cert.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Renew
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {mockTrainingData.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No training certifications</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first training certification</p>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Certification
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </BaseLayout>
  )
}