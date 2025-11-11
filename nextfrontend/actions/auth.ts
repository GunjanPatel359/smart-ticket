"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const register = async(data: {
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  role: "user" | "admin" | "technician";
  password: string;
  confirmPassword: string;
}): Promise<{
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}>=> {
  try {
    const { firstName, lastName, email, department, role, password, confirmPassword } = data;

    // 1. Validate
    if (!firstName || !lastName || !email || !password || !confirmPassword || !role) {
      return { success: false, message: "All required fields must be filled" };
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match" };
    }

    // 2. Check if email exists (for User/Admin only)
    if (role === "user" || role === "admin" || role === "technician") {
      const existing = await prisma[role].findUnique({ where: { email } });
      if (existing) {
        return { success: false, message: "User with this email already exists" };
      }
    }else{
        return {success:false, message: "Invalid role"}
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    let newUser;
    if (role === "admin") {
      newUser = await prisma.admin.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password: hashedPassword,
          department,
        },
      });
    } else if (role === "technician") {
      newUser = await prisma.technician.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password: hashedPassword,
          workload: 0,
          department
        },
      });
    } else {
      newUser = await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password: hashedPassword,
          department,
        },
      });
    }

    return {
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Internal server error" };
  }
}

type Role = "user" | "technician" | "admin";

export const login = async ({
  email,
  password,
  role,
}: {
  email: string;
  password: string;
  role: Role;
}): Promise<{
  success: boolean;
  message: string;
  user_token?: string;
  technician_token?: string;
  admin_token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  }}> => {
  try {
    let user;

    // Find user depending on role
    if (role === "user") {
      user = await prisma.user.findUnique({ where: { email } });
    } else if (role === "admin") {
      user = await prisma.admin.findUnique({ where: { email } });
    } else if (role === "technician") {
      user = await prisma.technician.findUnique({ where: { email } });
    }else{
        return {success:false, message: "Invalide User"}
    }

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid credentials" };
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    // Attach role-specific token key
    const tokenKey = role === "technician" ? "technician_token" : role === "admin" ? "admin_token" : "user_token";

    cookies().set(tokenKey,token)
    return {
      success: true,
      message: "Login successful",
      [tokenKey]: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Something went wrong" };
  }
};

