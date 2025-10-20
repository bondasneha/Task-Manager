"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  status?: string;
}


// Paste the earlier Dashboard UI code here
