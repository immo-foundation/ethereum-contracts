
const High1000 = artifacts.require("High1000");

contract('High1000', async (accounts) => {
	
	let contract = null;
		
	const MEMBER_NAME = "John Doe";
	const MEMBER_GROUP = 1;
	const MEMBER_COUNTRY = "Anytown, USA";
	const MEMBER_LINKEDIN = "linkedin.com/profile1";
		
	const MEMBER2_NAME = "Jane Doe";
	const MEMBER2_GROUP = 2;
	const MEMBER2_COUNTRY = "Podunk, USA";
	const MEMBER2_LINKEDIN = "linkedin.com/profile2";
	
	const PROPERTY_NAME = 1;
	const PROPERTY_COUNTRY = 2;
	const PROPERTY_LINKEDIN = 3;
	const PROPERTY_FACEBOOK = 4;
	const PROPERTY_TELEGRAM = 5;
	
	it("should deploy the contract", async () => {
		
		contract = await High1000.new();
		assert.equal(await contract.admin(), accounts[0]);
		assert.equal(await contract.manager(), accounts[0]);
	});
	
	
	/* CHANING A MANAGER */	
	
	it("should change a manager", async () => {
		
		await contract.setManager(accounts[1]);
		assert.equal(await contract.admin(), accounts[0]);
		assert.equal(await contract.manager(), accounts[1]);
	});	
	
	it("should fail changing a manager because of not owner", async () => {
		
		await expectException(
				contract.setManager(accounts[2], { from: accounts[1] }));
		
		await expectException(
				contract.setManager(accounts[3], { from: accounts[2] }));
	});
		
	/* ADDING A MEMBER */
	
	var memberId = "0x0";
	
	it("should add a member", async () => {
		
		compareArrays(await contract.memberIds(), [ ]);
		
		await contract.addMember(
				MEMBER_NAME, 
				MEMBER_GROUP, 
				MEMBER_COUNTRY, 
				MEMBER_LINKEDIN,
				{ from: accounts[1] });
		
		var memberIds = await contract.memberIds();
		assert.equal(memberIds.length, 1);
		
		memberId = memberIds[0];
		var properties = await contract.memberInfo(memberId);
		assert.equal(properties[0], MEMBER_NAME);
	});	
	
	it("should fail adding a member because the contract is being edited by not a manager", async () => {
		
		await expectException(
				contract.addMember(
						MEMBER_NAME, 
						MEMBER_GROUP, 
						MEMBER_COUNTRY, 
						MEMBER_LINKEDIN,
						{ from: accounts[0] }));
		
		await expectException(
				contract.addMember(
						MEMBER_NAME, 
						MEMBER_GROUP, 
						MEMBER_COUNTRY, 
						MEMBER_LINKEDIN,
						{ from: accounts[2] }));
	});
	
	
	/* UPDATING A MEMBER */
	
	it("should update member properties", async () => {
		
		await contract.setMemberName(memberId, MEMBER2_NAME, { from: accounts[1] });
		await contract.setMemberGroup(memberId, MEMBER2_GROUP, { from: accounts[1] });
		await contract.setMemberCountry(memberId, MEMBER2_COUNTRY, { from: accounts[1] });
		await contract.setMemberLinkedInProfile(memberId, MEMBER2_LINKEDIN, { from: accounts[1] });
		
		var properties = await contract.memberInfo(memberId);
		
		assert.equal(properties[0], MEMBER2_NAME);
		assert.equal(properties[1], MEMBER2_COUNTRY);
		assert.equal(properties[2], MEMBER2_LINKEDIN);
		assert.equal(properties[4], MEMBER2_GROUP);
	});
	
	it("should fail updating member properties because the member is not existed", async () => {
		
		await expectException(
				contract.setMemberName(1, MEMBER_NAME, { from: accounts[1] })
		);
		
		await expectException(
				contract.setMemberGroup(1, MEMBER_GROUP, { from: accounts[1] })
		);
		
		await expectException(
				contract.setMemberCountry(1, MEMBER_COUNTRY, { from: accounts[1] })
		);
		
		await expectException(
				contract.setMemberLinkedInProfile(1, MEMBER_LINKEDIN, { from: accounts[1] })
		);
	});	
	
	it("should fail updating member properties because the contract is being edited by not a manager", async () => {
		
		await expectException(
				contract.setMemberName(memberId, MEMBER_NAME, { from: accounts[2] })
		);
		
		await expectException(
				contract.setMemberGroup(memberId, MEMBER_GROUP, { from: accounts[2] })
		);
		
		await expectException(
				contract.setMemberCountry(memberId, MEMBER_COUNTRY, { from: accounts[2] })
		);
		
		await expectException(
				contract.setMemberLinkedInProfile(memberId, MEMBER_LINKEDIN, { from: accounts[2] })
		);
	});
		
	
	/* DELETING A MEMBER */	
	
	it("should fail deleting a member because the contract is being edited by not a manager", async () => {
										
		await expectException(
				contract.deleteMember(
						memberId,
						{ from: accounts[2] }));
	});
	
	it("should delete a member", async () => {
						
		await contract.deleteMember(memberId, { from: accounts[1] });
						
		//await expectException(
		//		contract.memberInfo(memberId, { from: accounts[1] }));
				
		var memberInfo = await contract.memberInfo(memberId, { from: accounts[1] });
		
		assert.equal(memberInfo[0], "");
		assert.equal(memberInfo[1], "");
		assert.equal(memberInfo[2], "");
		assert.equal(memberInfo[3], 0);
		assert.equal(memberInfo[4], 0);
		
		
		compareArrays(await contract.memberIds(), []);
	});
	
	it("should fail deleting a member because of the member is not existed", async () => {
								
		await expectException(
				contract.deleteMember(memberId, { from: accounts[1] }));
								
		await expectException(
				contract.deleteMember(1, { from: accounts[1] }));
	});	
});

function compareArrays(array1, array2) {
	
	assert.equal(array1.length, array2.length);
	
	for(var i = 0; i < array1.length; i++) {
		
		assert.equal(array1[i], array2[i]);
	}
}

async function expectException(f) {
	
	var exceptionOccurred = true;
	
	try {
		await f;
		exceptionOccurred = false;
		
	} catch(ex) { }
	
	assert.isOk(exceptionOccurred, "Exceptions not occurred");	
}
