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
			{/* !className[/Create an account/] outline !outline-red-500 */}
			<Heading>Create an account</Heading>
			{/* !className[/Enter your email below to create your account/] outline !outline-green-500 */}
			<SubText>Enter your email below to create your account</SubText>
			<Form>
				{/* !className[/Enter your email.../] outline !outline-blue-500 */}
				<Input placeholder="Enter your email..." />
				{/* !className[/Sign In with Email/] outline !outline-yellow-500 */}
				<Button>Sign In with Email</Button>
			</Form>
			<Divider>
				{/* !className[/Or continue with/] outline !outline-purple-500 */}
				<span>Or continue with</span>
			</Divider>
			{/* !className[/GitHub/] outline !outline-orange-500 */}
			<Button icon="github">GitHub</Button>
			<Footer>
				{/* !className[/D.+\\}/] outline !outline-lime-500 */}
				Don&apos;t have an account?{" "}
				{/* !className[/<a.+a>/] outline !outline-cyan-500 */}
				<a href="#">Sign up</a>
			</Footer>
		</Card>
	);
}`;

export const CODE_STEP_3 = `export function LoginPage() {
	return (
		<Card>
			{/* !className[/\{t\(.+\)\}/] outline !outline-red-500 */}
			<Heading>{t('create-an-account')}</Heading>
			{/* !className[/\{t\(.+\)\}/] outline !outline-green-500 */}
			<SubText>{t('enter-your-email-below')}</SubText>
			<Form>
				{/* !className[/\{t\(.+\)\}/] outline !outline-blue-500 */}
				<Input placeholder={t('enter-your-email')} />
				{/* !className[/\{t\(.+\)\}/] outline !outline-yellow-500 */}
				<Button>{t('sign-in-with-email')}</Button>
			</Form>
			<Divider>
				{/* !className[/\{t\(.+\)\}/] outline !outline-purple-500 */}
				<span>{t('or-continue-with')}</span>
			</Divider>
			{/* !className[/\{t\(.+\)\}/] outline !outline-orange-500 */}
			<Button icon="github">{t('github')}</Button>
			<Footer>
				{/* !className[/\\{t\\(.+/] outline !outline-lime-500 */}
				{t("sign-up-message", {
					{/* !className[/\\s{2}link.+a>/] outline !outline-cyan-500 */}
					link: <a href="#">{t("sign-up-link")}</a>
				{/* !className[/\\S+/] outline !outline-rose-500 */}
				})}
			</Footer>
		</Card>
	);
}`;
