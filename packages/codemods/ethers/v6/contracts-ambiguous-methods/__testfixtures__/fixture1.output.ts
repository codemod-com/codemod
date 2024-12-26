abi = ['function foo(address bar)', 'function foo(uint160 bar)'];
contract = new Contract(address, abi, provider);

contract.foo(Typed.address(addr));