import { exec } from "child_process";

exec("npm install -g esbuild --no-audit", (error, stdout, stderr) => {
	if (error) {
		console.error(`codemod (postinstall error) - ${error}`);
		return;
	}

	console.log("codemod - esbuild installed globally");
});
