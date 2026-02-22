interface FormStepProps {
  step: number
  totalSteps: number
  title: string
  description?: string
  children: React.ReactNode
}

export default function FormStep({ step, totalSteps, title, description, children }: FormStepProps) {
  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted">
            Paso {step} de {totalSteps}
          </span>
          <span className="text-muted">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {description && <p className="text-muted mt-1">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}
