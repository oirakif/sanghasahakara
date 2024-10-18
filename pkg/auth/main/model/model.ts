import Joi from "joi";

const LoginPayloadSchema = Joi.object({
    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$'))
        .required()
        .messages({
            'string.pattern.base': 'Password must fulfill all of these criterias : 1. contains at least one lower character 2. contains at least one upper character 3. contains at least one digit character 4. contains at least one special character 5. contains at least 8 characters',
            'string.empty': 'Password is required.',
        }),
})


const RegisterPayloadSchema = Joi.object({
    email: Joi.string()
        .email()
        .required(),
    password: Joi.string()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$'))
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long.',
            'string.empty': 'Password is required.',
        }),
    display_name: Joi.string().
        min(3).
        required()
})

export { LoginPayloadSchema, RegisterPayloadSchema }