export const JSON_STEP_1 = `{
	"create-an-account": "Create an account",
	"enter-your-email-below": "Enter your email below to create your account",
	"enter-your-email": "Enter your email...",
	"sign-in-with-email": "Sign in with email",
	"or-continue-with": "Or continue with",
	"github": "Github",
	"sign-up-message": "¿No tienes una cuenta? {link}",
	"sign-up-link": "Regístrate",
}`;

export const JSON_STEP_2 = `{
	"create-an-account": "Crea una cuenta",
	"enter-your-email-below": "Ingresa tu correo electrónico abajo para crear tu cuenta",
	"enter-your-email": "Introduce tu correo electrónico...",
	"sign-in-with-email": "Inicia sesión con tu correo",
	"or-continue-with": "O continúa con",
	"github": "Github",
	"sign-up-message": "¿No tienes una cuenta? {link}",
	"sign-up-link": "Regístrate",
}`;

export const CODE_STEP_1 = `export function LoginPage() {
	return (
		<Card>
			<Heading>Create an account</Heading>
			<SubText>Enter your email below to create your account</SubText>
			<Form>
				<Input placeholder="Enter your email..." />
				<Button>Sign In with Email</Button>
			</Form>
			<Divider>
				<span>Or continue with</span>
			</Divider>
			<Button icon="github">GitHub</Button>
			<Footer>
				Don&apos;t have an account?{" "}
				<a href="#">Sign up</a>
			</Footer>
		</Card>
	);
}`;

export const CODE_STEP_2 = `export function LoginPage() {
	return (
		<Card>
			<Heading>
				// !className[/Create an account/] outline outline-dashed outline-red-500
				Create an account
			</Heading>
			<SubText>
				// !className[/Enter your email below to create your account/] outline outline-dashed outline-green-500
				Enter your email below to create your account
			</SubText>
			<Form>
				<Input
					// !className[/Enter your email.../] outline outline-dashed outline-blue-500
					placeholder="Enter your email..."
				/>
				<Button>
					// !className[/Sign In with Email/] outline outline-dashed outline-yellow-500
					Sign In with Email
				</Button>
			</Form>
			<Divider>
				<span>
					// !className[/Or continue with/] outline outline-dashed outline-purple-500
					Or continue with
				</span>
			</Divider>
			<Button icon="github">
				// !className[/GitHub/] outline outline-dashed outline-orange-500
				GitHub
			</Button>
			<Footer>
				// !className[/D.+\\}/] outline outline-dashed outline-lime-500
				Don&apos;t have an account?{" "}
				// !className[/<a.+a>/] outline outline-dashed outline-cyan-500
				<a href="#">Sign up</a>
			</Footer>
		</Card>
	);
}`;

export const CODE_STEP_3 = `export function LoginPage() {
	return (
		<Card>
			<Heading>
				// !className[/\{t\(.+\)\}/] outline outline-dashed outline-red-500
				{t('create-an-account')}
			</Heading>
			<SubText>
				// !className[/\{t\(.+\)\}/] outline outline-dashed outline-green-500
				{t('enter-your-email-below')}
			</SubText>
			<Form>
				<Input
					// !className[/\{t\(.+\)\}/] outline outline-dashed outline-blue-500
					placeholder={t('enter-your-email')}
				/>
				<Button>
					// !className[/\{t\(.+\)\}/] outline outline-dashed outline-yellow-500
					{t('sign-in-with-email')}
				</Button>
			</Form>
			<Divider>
				<span>
					// !className[/\{t\(.+\)\}/] outline outline-dashed outline-purple-500
					{t('or-continue-with')}
				</span>
			</Divider>
			<Button icon="github">
				// !className[/\{t\(.+\)\}/] outline outline-dashed outline-orange-500
				{t('github')}
			</Button>
			<Footer>
				// !className[/\\{t\\(.+/] outline outline-dashed outline-lime-500
				{t("sign-up-message", {
					// !className[/\\s{2}link.+a>/] outline outline-dashed outline-cyan-500
					link: <a href="#">{t("sign-up-link")}</a>
				// !className[/\\S+/] outline outline-dashed outline-rose-500
				})}
			</Footer>
		</Card>
	);
}`;
