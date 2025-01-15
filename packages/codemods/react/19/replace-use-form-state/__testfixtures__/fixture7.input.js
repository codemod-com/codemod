"use client";

import React from "react";
import { useFormState } from "react-dom";

export const UserRegistrationFormComponent = () => {
    const [formState, formAction] = useFormState(signupAction, initialState);

    return <form>{/* Form fields go here */}</form>;
};
