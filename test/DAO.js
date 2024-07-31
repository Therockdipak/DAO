const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("DAO", async ()=> {
    let dao;
    let creator;
    let addr1;
    let addr2;

    beforeEach(async ()=> {
       [creator,addr1, addr2] = await ethers.getSigners();
       dao = await ethers.deployContract("DAO",[]);
        console.log(await dao.getAddress());
    });

    describe("deployment", async ()=>{
       it("should set right owner", async ()=>{
          expect(await dao.owner()).to.equal(creator.address);
       });

       it("should add a new member", async ()=> {
         await dao.addMember(addr1.address);
         expect(await dao.members(addr1.address)).to.equal(true);
       });

       it("should fail to add an existing member", async ()=> {
          await dao.addMember(addr1.address);
          expect(await dao.members(addr1.address)).to.be.revertedWith("already added");
       });
    });

     describe("Proposals", ()=> {
         beforeEach(async ()=> {
            await dao.addMember(addr1.address);
            await dao.addMember(addr2.address);
         })

         it("should create a new proposal", async ()=> {
             await dao.connect(addr1).createProposal("Proposal 1");
             const proposal = await dao.proposals(0);
             expect(proposal.description).to.equal("Proposal 1");
         });
          
     });

     describe("voting", async ()=> {
         beforeEach(async ()=> {
            await dao.addMember(addr1.address);
            await dao.connect(addr1).createProposal("vote proposal");
         });

         it("should allow member to vote", async ()=> {
            await dao.connect(addr1).vote(0, true);
            const proposal = await dao.proposals(0);
            expect(proposal.votesFor).to.equal(1);
            expect(proposal.voteAgainst).to.equal();
         });
     });


     describe("Execute", async ()=> {
          it("should execute a proposal", async ()=> {
            await dao.connect(creator).addMember(addr1.address);
            await dao.connect(creator).addMember(addr2.address);
            await dao.connect(addr1).createProposal("new proposal");

            await dao.connect(addr1).vote(0, true);
            await dao.connect(addr2).vote(0, true);

            await dao.connect(addr1).executeProposal(0);
            const proposal = await dao.proposals(0);
            expect(proposal.executed).to.be.true;
          });
     });

     describe("transfer", async ()=> {
          it("should transfer shares", async ()=> {
            await dao.connect(creator).addMember(creator.address);
            await dao.connect(creator).addMember(addr1.address);
            await dao.connect(creator).addMember(addr2.address);
          
            await dao.connect(creator).transferShares(100, addr1.address);
            expect(await dao.shares(addr1.address)).to.equal(100);
            await dao.connect(addr1).transferShares(50, addr2.address);

            expect(await dao.shares(addr1.address)).to.equal(50);
            expect(await dao.shares(addr2.address)).to.equal(50);
          });
     });
    
});