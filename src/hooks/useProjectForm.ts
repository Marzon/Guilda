import { useState, useEffect } from "react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: "IDEA" | "MVP" | "SCALE";
  is_recruiting: boolean;
  is_showcase: boolean;
  owner_id: string;
  cover_image_url?: string | null;
  seeking_capital?: boolean;
  capital_amount_sought?: number | null;
}

export interface ProjectFormData {
  title: string;
  description: string;
  status: "IDEA" | "MVP" | "SCALE";
  is_recruiting: boolean;
  is_showcase: boolean;
  cover_image_url: string | null;
  seeking_capital: boolean;
  capital_amount_sought: number | null;
}

const defaultFormData: ProjectFormData = {
  title: "",
  description: "",
  status: "IDEA",
  is_recruiting: true,
  is_showcase: false,
  cover_image_url: null,
  seeking_capital: false,
  capital_amount_sought: null,
};

interface UseProjectFormOptions {
  project: Project | null | undefined;
}

export const useProjectForm = ({ project }: UseProjectFormOptions) => {
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);

  // Sync form data when project loads
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || "",
        status: project.status,
        is_recruiting: project.is_recruiting,
        is_showcase: project.is_showcase || false,
        cover_image_url: project.cover_image_url || null,
        seeking_capital: project.seeking_capital || false,
        capital_amount_sought: project.capital_amount_sought || null,
      });
    }
  }, [project]);

  // Helper to update a single field
  const updateField = <K extends keyof ProjectFormData>(
    field: K,
    value: ProjectFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Reset form to default
  const resetForm = () => {
    setFormData(defaultFormData);
  };

  return {
    formData,
    setFormData,
    updateField,
    resetForm,
  };
};
