const Proxy = artifacts.require("Proxy");
const StubV1BaseContract = artifacts.require("StubV1BaseContract");
const StubV2BaseContract = artifacts.require("StubV2BaseContract");
const StubV3BaseContract = artifacts.require("StubV3BaseContract");

contract('BaseContract', async (accounts) => {
	
	let contractV1 = null;
	let contractV2 = null;
		
	it("should deploy the first version of the contract", async () => {
		
		var firstVersionCode = await StubV1BaseContract.new();
		var proxy = await Proxy.new(firstVersionCode.address);
		
		contractV1 = await StubV1BaseContract.at(proxy.address);
		
		assert.equal(await contractV1.currentImplementation(), firstVersionCode.address);
		assert.equal(await contractV1.admin(), accounts[0]);
		assert.equal(await contractV1.version(), "1.0.0");
		assert.equal(await contractV1.versionCode(), 1);
	});	
	
	
	it("should update the contract", async () => {
		
		var secondVersionCode = await StubV2BaseContract.new();
		await contractV1.upgrade(secondVersionCode.address);
		
		contractV2 = await StubV2BaseContract.at(contractV1.address);
		
		assert.equal(await contractV2.currentImplementation(), secondVersionCode.address);
		assert.equal(await contractV2.version(), "1.0.1");
		assert.equal(await contractV2.versionCode(), 2);
	});	
	
	
	it("should fail the contract upgrade by not admin", async () => {
		
		var secondVersionCode = await StubV2BaseContract.new();
		
		await expectException(
				contractV2.upgrade(secondVersionCode.address, { from: accounts[1] }));
	});
	
	
	it("should fail the contract upgrade with an incorrect contract address", async () => {
				
		await expectException(
				contractV2.upgrade(0x0, { from: accounts[1] }));
				
		await expectException(
				contractV2.upgrade(0x1, { from: accounts[1] }));
	});
	
	
	it("should fail an upgradeState() call", async () => {
				
		await expectException(
					contractV2.upgradeState());
	});
	
	
	it("should transfer the contract admin rights", async () => {
		
		await contractV2.transferAdminRights(accounts[1]);		
		assert.equal(await contractV1.pendingAdmin(), accounts[1]);
		
		await contractV2.claimAdminRights({ from: accounts[1] });		
		assert.equal(await contractV1.admin(), accounts[1]);
	});
	
	
	it("should fail a transferAdminRights() call", async () => {
				
		var exceptionOccurred = true;
		
		await expectException(
				contractV2.transferAdminRights(accounts[2], { from: accounts[2] }));
				 
		await expectException(
				contractV2.transferAdminRights(accounts[3], { from: accounts[2] }));
	});
	
	
	it("should fail a claimAdminRights() call", async () => {
		
		await contractV2.transferAdminRights(accounts[0], { from: accounts[1] });
		
		await expectException(
				contractV2.claimAdminRights({ from: accounts[2] }));
	});
});

async function expectException(f) {
	
	var exceptionOccurred = true;
	
	try {
		await f;
		exceptionOccurred = false;
		
	} catch(ex) { }
	
	assert.isOk(exceptionOccurred, "Exceptions not occurred");
}