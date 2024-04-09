const { exec } = require("child_process");

exec("npm install -g esbuild --no-audit", (error, stdout, stderr) => {
	if (error) {
		console.error(`Codemod CLI postinstall error: ${error}`);
		return;
	}

	console.log(`stdout: ${stdout}`);
	console.error(`stderr: ${stderr}`);
});
