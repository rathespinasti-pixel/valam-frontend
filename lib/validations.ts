import { z } from "zod";

/**
 * Helper to extract field-level error messages from Zod safeParse result
 */
export function getFieldErrors(result: { success: false; error: z.ZodError }): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

// -------------------------------------------------------------
// 1. AUTH SCHEMAS
// -------------------------------------------------------------
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    role: z.enum(["farmer", "consumer"]),
    full_name: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .min(2, "Full name must be at least 2 characters"),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .min(9, "Phone number must be at least 9 digits"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    preferred_language: z.enum(["en", "ta", "si"]),
    district: z.string().trim().min(1, "District is required"),
    ds_division: z.string().trim().min(1, "DS Division is required"),
    gn_division: z.string().trim().optional(),
    
    // Role: Consumer
    delivery_address: z.string().trim().optional(),
    
    // Role: Farmer
    farming_category: z.string().trim().optional(),
    farm_location: z.string().trim().optional(),
    land_size: z
      .union([z.number(), z.string()])
      .optional()
      .transform((val) => (val === "" || val === undefined ? undefined : Number(val))),
    land_size_unit: z.string().trim().optional(),
    irrigation_preference: z.string().trim().optional(),
    fertilizer_preference: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "consumer" && !data.delivery_address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Delivery address is required for consumers",
        path: ["delivery_address"],
      });
    }
    if (data.role === "farmer") {
      if (!data.farming_category) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Farming category is required for farmers",
          path: ["farming_category"],
        });
      }
      if (data.land_size === undefined || isNaN(data.land_size) || data.land_size <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Land size must be a positive number",
          path: ["land_size"],
        });
      }
    }
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// -------------------------------------------------------------
// 2. CLOUD MARKET & BARGAINING SCHEMAS
// -------------------------------------------------------------
export const produceListingSchema = z.object({
  crop_name: z.string().trim().min(1, "Crop / Produce name is required"),
  variety: z.string().trim().optional(),
  total_quantity_kg: z
    .union([z.number(), z.string()])
    .refine((v) => v !== "" && v !== undefined && !isNaN(Number(v)) && Number(v) > 0, {
      message: "Total harvest quantity must be greater than 0 kg",
    })
    .transform(Number),
  asking_price_per_kg: z
    .union([z.number(), z.string()])
    .refine((v) => v !== "" && v !== undefined && !isNaN(Number(v)) && Number(v) > 0, {
      message: "Asking price must be greater than Rs. 0",
    })
    .transform(Number),
  min_acceptable_price_per_kg: z
    .union([z.number(), z.string()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
  district: z.string().trim().min(1, "District is required"),
  location: z.string().trim().optional(),
  harvest_date: z.string().trim().optional(),
  is_organic: z.boolean().default(false),
  is_negotiable: z.boolean().default(true),
  description: z.string().trim().optional(),
  image_url: z.string().trim().optional(),
});

export type ProduceListingFormData = z.infer<typeof produceListingSchema>;

export const bargainOfferSchema = z.object({
  quantity_kg: z
    .union([z.number(), z.string()])
    .refine((v) => v !== "" && v !== undefined && !isNaN(Number(v)) && Number(v) > 0, {
      message: "Desired quantity must be greater than 0 kg",
    })
    .transform(Number),
  offered_price_per_kg: z
    .union([z.number(), z.string()])
    .refine((v) => v !== "" && v !== undefined && !isNaN(Number(v)) && Number(v) > 0, {
      message: "Offer price must be greater than Rs. 0 per kg",
    })
    .transform(Number),
  buyer_message: z.string().trim().optional(),
});

export type BargainOfferFormData = z.infer<typeof bargainOfferSchema>;

export const counterOfferSchema = z.object({
  counter_price_per_kg: z
    .union([z.number(), z.string()])
    .refine((v) => v !== "" && v !== undefined && !isNaN(Number(v)) && Number(v) > 0, {
      message: "Counter price must be greater than Rs. 0 per kg",
    })
    .transform(Number),
  counter_message: z.string().trim().optional(),
});

export type CounterOfferFormData = z.infer<typeof counterOfferSchema>;

// -------------------------------------------------------------
// 3. CROPS & AGRONOMY SCHEMAS
// -------------------------------------------------------------
export const addCropSchema = z.object({
  crop_name: z.string().trim().min(1, "Crop name is required"),
  variety: z.string().trim().optional(),
  planting_method: z.string().trim().min(1, "Planting method is required"),
  planting_date: z.string().trim().min(1, "Planting date is required"),
  land_size: z
    .union([z.number(), z.string()])
    .refine((v) => v !== "" && v !== undefined && !isNaN(Number(v)) && Number(v) > 0, {
      message: "Land size must be greater than 0",
    })
    .transform(Number),
  land_size_unit: z.string().trim().min(1, "Land unit is required"),
  irrigation_type: z.string().trim().min(1, "Irrigation type is required"),
  fertilizer_preference: z.string().trim().min(1, "Fertilizer preference is required"),
  notes: z.string().trim().optional(),
});

export type AddCropFormData = z.infer<typeof addCropSchema>;

// -------------------------------------------------------------
// 4. PLANT DISEASE DIAGNOSIS SCHEMA
// -------------------------------------------------------------
export const diagnosisSchema = z.object({
  crop_name: z.string().trim().min(1, "Target crop is required"),
  plant_part: z.string().trim().min(1, "Affected plant part is required"),
  symptoms: z.string().trim().min(5, "Please describe the symptoms (at least 5 characters)"),
  image_url: z.string().trim().optional(),
});

export type DiagnosisFormData = z.infer<typeof diagnosisSchema>;

// -------------------------------------------------------------
// 5. COMMUNITY FORUM SCHEMAS
// -------------------------------------------------------------
export const communityPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Discussion title is required")
    .min(5, "Title must be at least 5 characters"),
  category: z.string().trim().min(1, "Please select a category"),
  content: z
    .string()
    .trim()
    .min(1, "Question / details are required")
    .min(10, "Please provide more details (at least 10 characters)"),
  image_url: z.string().trim().optional(),
});

export type CommunityPostFormData = z.infer<typeof communityPostSchema>;

export const communityCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment reply cannot be empty")
    .min(2, "Reply must be at least 2 characters"),
});

export type CommunityCommentFormData = z.infer<typeof communityCommentSchema>;

// -------------------------------------------------------------
// 6. ONBOARDING & SETTINGS SCHEMAS
// -------------------------------------------------------------
export const onboardingSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required"),
  preferred_language: z.enum(["en", "ta", "si"]),
  district: z.string().trim().min(1, "District is required"),
  ds_division: z.string().trim().min(1, "DS Division is required"),
  gn_division: z.string().trim().optional(),
  farming_category: z.string().trim().min(1, "Farming category is required"),
  farm_location: z.string().trim().optional(),
  land_size: z
    .union([z.number(), z.string()])
    .refine((v) => v !== "" && v !== undefined && !isNaN(Number(v)) && Number(v) > 0, {
      message: "Land size must be a positive number",
    })
    .transform(Number),
  land_size_unit: z.string().trim().min(1, "Land unit is required"),
  irrigation_preference: z.string().trim().min(1, "Irrigation preference is required"),
  fertilizer_preference: z.string().trim().min(1, "Fertilizer preference is required"),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const userSettingsSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().min(9, "Valid phone number is required"),
  district: z.string().trim().min(1, "District is required"),
  ds_division: z.string().trim().min(1, "DS Division is required"),
  gn_division: z.string().trim().optional(),
  delivery_address: z.string().trim().optional(),
  farming_category: z.string().trim().optional(),
  farm_location: z.string().trim().optional(),
  preferred_language: z.enum(["en", "ta", "si"]).optional(),
});

export type UserSettingsFormData = z.infer<typeof userSettingsSchema>;

// -------------------------------------------------------------
// 7. CONTACT FORM SCHEMA
// -------------------------------------------------------------
export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().min(9, "Valid phone number is required"),
  email: z.string().trim().email("Valid email address is required"),
  topic: z.string().trim().min(1, "Topic is required"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// -------------------------------------------------------------
// 8. SOLAR CALCULATOR SCHEMA
// -------------------------------------------------------------
export const solarCalcSchema = z.object({
  cropName: z.string().trim().min(1, "Crop name is required"),
  irrigationMethod: z.string().trim().min(1, "Irrigation method is required"),
  landSize: z
    .union([z.number(), z.string()])
    .refine((v) => v !== "" && v !== undefined && !isNaN(Number(v)) && Number(v) > 0, {
      message: "Land size must be greater than 0",
    })
    .transform(Number),
  landUnit: z.string().trim().min(1, "Land unit is required"),
  waterSource: z.string().trim().min(1, "Water source is required"),
  pumpHp: z.string().trim().min(1, "Pump HP is required"),
});

export type SolarCalcFormData = z.infer<typeof solarCalcSchema>;
