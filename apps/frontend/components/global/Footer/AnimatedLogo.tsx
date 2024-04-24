"use client";
import Lottie from "lottie-react";
import data from "./logo.json";

export default function AnimatedLogo() {
  return <Lottie className="max-h-[45px] max-w-[45px]" animationData={data} />;
}
