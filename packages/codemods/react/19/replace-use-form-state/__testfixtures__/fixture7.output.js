"use client";

import React, { useActionState } from "react";

export const UserRegistrationFormComponent = () => {
    const [formState, formAction] = useActionState(signupAction, initialState);

    return <form>{/* Form fields go here */}</form>;
};
