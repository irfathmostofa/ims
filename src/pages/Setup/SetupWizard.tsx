"use client";

import BranchForm from "@/components/Setup/BranchForm";
import CompanyForm from "@/components/Setup/CompanyForm";
import FinishSetup from "@/components/Setup/FinishSetup";
import ProgressStepper from "@/components/Setup/ProgressStepper";
import RoleForm from "@/components/Setup/RoleForm";
import UserForm from "@/components/Setup/UserForm";
import { useState } from "react";

const steps = ["Company", "Branches", "Roles", "Users", "Finish"];

export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [setupData, setSetupData] = useState<any>({
    company: {},
    branches: [],
    roles: [],
    users: [],
  });

  const next = () => setCurrentStep((prev) => prev + 1);
  const back = () => setCurrentStep((prev) => prev - 1);

  const saveStepData = (step: string, data: any) => {
    setSetupData((prev: any) => ({
      ...prev,
      [step]: data,
    }));
    next();
  };

  return (
    <div className="w-full  bg-white rounded-2xl shadow-xl p-6">
      <ProgressStepper steps={steps} currentStep={currentStep} />

      {currentStep === 0 && (
        <CompanyForm
          onNext={(data) => saveStepData("company", data)}
          defaultValues={setupData.company}
        />
      )}

      {currentStep === 1 && (
        <BranchForm
          company_id={setupData.company.id}
          onNext={(data) => saveStepData("branches", data)}
          onBack={back}
          defaultValues={setupData.branches}
        />
      )}

      {currentStep === 2 && (
        <RoleForm
          onNext={(data) => saveStepData("roles", data)}
          onBack={back}
          defaultValues={setupData.roles}
        />
      )}

      {currentStep === 3 && (
        <UserForm
          branches={setupData.branches || []} // Pass saved branches
          roles={setupData.roles || []} // Pass saved roles
          onNext={(data) => saveStepData("users", data)}
          onBack={back}
          defaultValues={setupData.users}
        />
      )}

      {currentStep === 4 && <FinishSetup data={setupData} onBack={back} />}
    </div>
  );
}
