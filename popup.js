const fileElement = document.querySelector('#pk_file');
var pk_value = "";
fileElement.addEventListener('change', (e) => {
	const file = e.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.readAsText(file); // 将文件读取为文本
		reader.onload = () => { // 文件读取完成后的回调
			console.log(reader.result, '////'); // 读取到的文件内容
			// displaySig(reader.result);
			pk_value = reader.result;
		}
		reader.onerror = (e) => {
			console.log(e, '????XXX')
		}
	}
});
const pubkeyElement = document.querySelector('#pubkey_file');
var pubkey_value = "";
pubkeyElement.addEventListener('change', (e) => {
	const file = e.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.readAsText(file); // 将文件读取为文本
		reader.onload = () => { // 文件读取完成后的回调
			console.log(reader.result, '////'); // 读取到的文件内容
			// displaySig(reader.result);
			pubkey_value = reader.result;
		}
		reader.onerror = (e) => {
			console.log(e, '????XXX')
		}
	}
});

document.addEventListener('DOMContentLoaded', function() {
	var link = document.getElementById('btn');
	// onClick's logic below:
	link.addEventListener('click', async function() {
		await submit();
	});
});

async function submit() {
	const rusty = await import("/pkg/time_capsule_wallet.js");
	// Fetch the wasm file.
	const wasm_src = chrome.extension.getURL("/pkg/time_capsule_wallet_bg.wasm");
	// rusty has an exported function 'default' that initializes the WebAssembly module.
	await rusty.default(wasm_src);

	let host = document.getElementById("host_url").value;
	let msg = document.getElementById("msg").value;
	let lock_time = document.getElementById("lock_time").value;
	if (host.length === 0) {
		alert("Please Input your Node Host,Firstly");
		return;
	}
	if (msg.length === 0) {
		alert("Please Input your Message,Firstly");
		return;
	}
	if (self.pk_value.length === 0) {
		alert("Please choose your PrivateKey,Firstly");
		return;
	}
	if (self.pubkey_value.length === 0) {
		alert("Please choose your PublicKey,Firstly");
		return;
	}
	if (lock_time.length === 0) {
		alert("Please Select Or Input Your Release Time Since Now,Firstly");
		return;
	}
	let selectValue = new Date(lock_time).getTime();
	console.log("~~~~~~~~~~~~~~~{}", selectValue);
	let now = new Date().getTime();
	console.log("~~~~~~~~~~~~~~~{}", now);
	let interval_time = Math.floor((selectValue - now) / 1000);
	if (interval_time > 0) {
		let response = await fetch(host + "/last");
		let res = await response.json();
		console.log("~~~~~~~~~~~~~~~", res);
		let last_block = JSON.stringify(res);
		let lock_time = interval_time.toString();
		console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~", lock_time);

		let result = rusty.send_transaction(last_block, self.pubkey_value, self.pk_value, lock_time, msg.toString());
		let dic = JSON.parse(result)
		console.log(dic);

		fetch(host + "/txion", {
				method: 'POST', // *GET, POST, PUT, DELETE, etc.
				headers: {
					// Overwrite Axios's automatically set Content-Type
					'Content-Type': 'application/json',
					'Accept':'text/xml'
				},
				body: JSON.stringify(dic)
			})
			.then(response => {
				return response.text();
			})
			.then(data => {
				console.log('Success:', data);
				alert(data);
			})
			.catch((error) => {
				console.log(error);
			});
	} else {
		alert("Please choose date and time after now");
	}
};