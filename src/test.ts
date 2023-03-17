import { Mina } from "@o1labs/client-sdk";

type PublicKey = {
  id: string;
  type_: string;
  controller: string;
  publicKeyHex: string;
}

type Service = {
  id: string;
  type_: string;
  serviceEndpoint: string;
}

type DIDDocument = {
  "@context": string[];
  id: string;
  publicKeys: PublicKey[];
  service: Service[];
}

class DIDRegistry {

  private client: Mina;

  constructor(endpoint: string, privateKey: string) {
    this.client = new Mina(endpoint, privateKey);
  }

  public async create_did(did: string, context: string[], public_keys: PublicKey[], services: Service[]): Promise<void> {
    const document: DIDDocument = {
      "@context": context,
      id: did,
      publicKeys: public_keys,
      service: services,
    }

    await this.client.sendTransaction([
      Mina.createTransactionInstruction(
        "did_registry",
        "create_did",
        { did: did, document: JSON.stringify(document) }
      )
    ]);
  }

  public async add_public_key(did: string, public_key: PublicKey): Promise<void> {
    const document: DIDDocument = await this.get_did_document(did);

    const existing_keys: PublicKey[] = document.publicKeys ?? [];
    if (existing_keys.some(k => k.id === public_key.id)) {
      throw new Error("Public key already exists");
    }

    const updated_keys: PublicKey[] = existing_keys.concat(public_key);
    const updated_document: DIDDocument = { ...document, publicKeys: updated_keys };

    await this.client.sendTransaction([
      Mina.createTransactionInstruction(
        "did_registry",
        "update_did",
        { did: did, document: JSON.stringify(updated_document) }
      )
    ]);
  }

  public async add_service(did: string, service: Service): Promise<void> {
    const document: DIDDocument = await this.get_did_document(did);

    const existing_services: Service[] = document.service ?? [];
    if (existing_services.some(s => s.id === service.id)) {
      throw new Error("Service already exists");
    }

    const updated_services: Service[] = existing_services.concat(service);
    const updated_document: DIDDocument = { ...document, service: updated_services };

    await this.client.sendTransaction([
      Mina.createTransactionInstruction(
        "did_registry",
        "update_did",
        { did: did, document: JSON.stringify(updated_document) }
      )
    ]);
  }

  public async get_did_document(did: string): Promise<DIDDocument> {
    const response = await this.client.callSmartContract(
      "did_registry",
      "get_did_document",
      { did: did }
    );

    if (response.status !== "applied") {
      throw new Error(`Error getting DID document: ${JSON.stringify(response)}`);
    }

    const document: DIDDocument = JSON.parse(response.result);

    return document;
  }

  public async register_name(name: string, did: string): Promise<void> {
    const document: DIDDocument = await this.get_did_document(did);

    await this.client.sendTransaction([
      Mina.createTransactionInstruction(
        "did_registry",
        "register_name",


  // update file on test scripts