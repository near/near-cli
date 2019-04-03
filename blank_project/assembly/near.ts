const DEFAULT_SCRATCH_BUFFER_SIZE: usize = 1 << 16;

type DataTypeIndex = u32;

const DATA_TYPE_ORIGINATOR_ACCOUNT_ID: DataTypeIndex = 1;
const DATA_TYPE_CURRENT_ACCOUNT_ID: DataTypeIndex = 2;
const DATA_TYPE_STORAGE: DataTypeIndex = 3;
const DATA_TYPE_INPUT: DataTypeIndex = 4;
const DATA_TYPE_RESULT: DataTypeIndex = 5;
const DATA_TYPE_STORAGE_ITER: DataTypeIndex = 6;

/**
 * Represents contract storage.
 */
export class Storage {
  private _scratchBuf: Uint8Array = new Uint8Array(DEFAULT_SCRATCH_BUFFER_SIZE);

  /**
   * Returns list of keys starting with given prefix.
   *
   * NOTE: Must be very careful to avoid exploding amount of compute with this method.
   * Make sure there is a hard limit on number of keys returned even if contract state size grows.
   */
  keys(prefix: string): string[] {
    let result: string[] = new Array<string>();
    let iterId = storage_iter(prefix.lengthUTF8 - 1, prefix.toUTF8());
    do {
      let key = this._internalReadString(DATA_TYPE_STORAGE_ITER, 0, iterId);
      if (key != null) {
        result.push(key);
      }
    } while (storage_iter_next(iterId));
    return result;
  }

  setItem(key: string, value: string): void {
    this.setString(key, value);
  }

  getItem(key: string): string {
    return this.getString(key);
  }

  /**
   * Store string value under given key. Both key and value are encoded as UTF-8 strings.
   */
  setString(key: string, value: string): void {
    storage_write(key.lengthUTF8 - 1, key.toUTF8(), value.lengthUTF8 - 1, value.toUTF8());
  }

  /**
   * Get string value stored under given key. Both key and value are encoded as UTF-8 strings.
   */
  getString(key: string): string {
    return this._internalReadString(DATA_TYPE_STORAGE, key.lengthUTF8 - 1, key.toUTF8());
  }

  /**
   * Store byte array under given key. Key is encoded as UTF-8 strings.
   * Byte array stored as is.
   *
   * It's convenient to use this together with `domainObject.encode()`.
   */
  setBytes(key: string, value: Uint8Array): void {
    storage_write(key.lengthUTF8 - 1, key.toUTF8(), value.byteLength, value.buffer.data);
  }

  /**
   * Get byte array stored under given key. Key is encoded as UTF-8 strings.
   * Byte array stored as is.
   *
   * It's convenient to use this together with `DomainObject.decode()`.
   */
  getBytes(key: string): Uint8Array {
    return this._internalReadBytes(DATA_TYPE_STORAGE, key.lengthUTF8 - 1, key.toUTF8());
  }

  hasKey(key: string): bool {
    return storage_has_key(key.lengthUTF8 - 1, key.toUTF8());
  }

  removeItem(key: string): void {
    storage_remove(key.lengthUTF8 - 1, key.toUTF8());
  }

  /**
   * Store 64-bit unsigned int under given key. Key is encoded as UTF-8 strings.
   * Number is encoded as decimal string.
   */
  setU64(key: string, value: u64): void {
    this.setItem(key, value.toString());
  }

  /**
   * Get 64-bit unsigned int stored under given key. Key is encoded as UTF-8 strings.
   * Number is encoded as decimal string.
   *
   * @returns int value or 0 if value is not found
   */
  getU64(key: string): u64 {
    return U64.parseInt(this.getItem(key) || "0");
  }

  /**
   * @hidden
   * Reads given params into the internal scratch buffer and returns length.
   */
  private _internalBufferRead(dataType: DataTypeIndex, keyLen: usize, key: usize): usize {
    for (let i = 0; i < 2; ++i) {
      let len = data_read(
        dataType,
        keyLen,
        key,
        this._scratchBuf.byteLength,
        this._scratchBuf.buffer.data,
      );
      if (len <= <usize>(this._scratchBuf.byteLength)) {
        return len;
      }
      this._scratchBuf = new Uint8Array(len);
    }
    assert(false, "Internal scratch buffer was resized more than once");
    return 0;
  }

  /**
   * @hidden
   * Reads a string for the given params.
   */
  _internalReadString(dataType: DataTypeIndex, keyLen: usize, key: usize): string {
    let len = this._internalBufferRead(dataType, keyLen, key);
    if (len == 0) {
      return null;
    }
    return String.fromUTF8(this._scratchBuf.buffer.data, len);
  }

  /**
   * @hidden
   * Reads bytes for the given params.
   */
  _internalReadBytes(dataType: DataTypeIndex, keyLen: usize, key: usize): Uint8Array {
    let len = this._internalBufferRead(dataType, keyLen, key);
    if (len == 0) {
      return null;
    }
    let res = new Uint8Array(len);
    memory.copy(res.buffer.data, this._scratchBuf.buffer.data, len);
    return res;
  }
}

export let storage: Storage = new Storage();

/**
 * Provides context for contract execution, including information about transaction sender, etc.
 */
class Context {
  /**
   * Account ID of transaction sender.
   */
  get sender(): string {
    return storage._internalReadString(DATA_TYPE_ORIGINATOR_ACCOUNT_ID, 0, 0);
  }

  /**
   * Account ID of contract.
   */
  get contractName(): string {
    return storage._internalReadString(DATA_TYPE_CURRENT_ACCOUNT_ID, 0, 0);
  }

  /**
   * Current block index.
   */
  get blockIndex(): u64 {
    return block_index();
  }

  /**
   * Current balance of the contract.
   */
  get currentBalance(): u64 {
    return balance();
  }

  /**
   * The amount of tokens received with this execution call.
   */
  get receivedAmount(): u64 {
    return received_amount();
  }

  /**
   * The amount of available gas left for this execution call.
   */
  get gasLeft(): u64 {
    return gas_left();
  }

  /**
   * The amount of available mana left for this execution call.
   */
  get manaLeft(): u32 {
    return mana_left();
  }
}

export let context: Context = new Context();

export namespace near {
  /**
   * Hash given data. Returns hash as 32-byte array.
   * @param data data can be passed as either Uint8Array or anything with .toString (hashed as UTF-8 string).
   */
  export function hash<T>(data: T): Uint8Array {
    let result = new Uint8Array(32);
    if (data instanceof Uint8Array) {
      _near_hash(data.byteLength, data.buffer.data, result.buffer.data);
    } else {
      let str = data.toString();
      _near_hash(str.lengthUTF8 - 1, str.toUTF8(), result.buffer.data);
    }
    return result;
  }

  /**
   * Hash given data. Returns hash as 32-bit integer.
   * @param data data can be passed as either Uint8Array or anything with .toString (hashed as UTF-8 string).
   */
  export function hash32<T>(data: T): u32 {
    let dataToHash : Uint8Array;
    if (data instanceof Uint8Array) {
      return _near_hash32(data.byteLength, data.buffer.data);
    } else {
      let str = data.toString();
      return _near_hash32(str.lengthUTF8 - 1, str.toUTF8());
    }
  }

  /**
   * Returns random byte buffer of given length.
   */
  export function randomBuffer(len: u32): Uint8Array {
    let result = new Uint8Array(len);
    _near_random_buf(len, result.buffer.data);
    return result;
  }

  /**
   * Returns random 32-bit integer.
   */
  export function random32(): u32 {
    return random32();
  }

  export function log(msg: string): void {
    _near_log(<usize>msg);
  }

  export function str<T>(value: T): string {
    let arr: Array<T> = [value];
    return arr.toString();
  }

  export function base58(source: Uint8Array): string {
    // Code converted from:
    // https://github.com/cryptocoinjs/base-x/blob/master/index.js
    const iFACTOR = 2; // TODO: Calculate precise value to avoid overallocating
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let BASE = ALPHABET.length;
    let LEADER = ALPHABET.charAt(0);

    // Skip & count leading zeroes.
    let zeroes = 0
    let length = 0
    let pbegin = 0
    let pend = source.length

    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++
      zeroes++
    }

    // Allocate enough space in big-endian base58 representation.
    let size = ((pend - pbegin) * iFACTOR + 1) >>> 0
    let b58 = new Uint8Array(size)

    // Process the bytes.
    while (pbegin !== pend) {
      let carry = i32(source[pbegin])

      // Apply "b58 = b58 * 256 + ch".
      let i = 0
      for (let it = size - 1; (carry !== 0 || i < length) && (it !== -1); it--, i++) {
        carry += (256 * b58[it]) >>> 0
        b58[it] = (carry % BASE) >>> 0
        carry = (carry / BASE) >>> 0
      }

      assert(carry == 0, 'Non-zero carry');
      length = i
      pbegin++
    }

    // Skip leading zeroes in base58 result.
    let it = size - length
    while (it !== size && b58[it] === 0) {
      it++
    }

    // Translate the result into a string.
    let str = LEADER.repeat(zeroes)
    for (; it < size; ++it) str += ALPHABET.charAt(b58[it])

    return str
  }
}

export class ContractPromise {
  id: i32;

  static create(
      contractName: string,
      methodName: string,
      args: Uint8Array,
      mana: u32,
      amount: u64 = 0
  ): ContractPromise {
    return {
      id: promise_create(
        contractName.lengthUTF8 - 1, contractName.toUTF8(),
        methodName.lengthUTF8 - 1, methodName.toUTF8(),
        args.byteLength, args.buffer.data,
        mana,
        amount)
    };
  }

  then(
      methodName: string,
      args: Uint8Array,
      mana: u32
  ): ContractPromise {
    return {
      id: promise_then(
        this.id,
        methodName.lengthUTF8 - 1, methodName.toUTF8(),
        args.byteLength, args.buffer.data,
        mana)
    };
  }

  returnAsResult(): void {
    return_promise(this.id);
  }

  static all(promises: ContractPromise[]): ContractPromise {
    assert(promises.length > 0);
    let id = promises[0].id;
    for (let i = 1; i < promises.length; i++) {
      id = promise_and(id, promises[i].id);
    }
    return { id };
  }

  static getResults() : ContractPromiseResult[] {
    let count = <i32>result_count();
    let results = new Array<ContractPromiseResult>(count);
    for (let i = 0; i < count; i++) {
      let isOk = result_is_ok(i);
      if (!isOk) {
        results[i] = { success: false }
        continue;
      }
      let buffer = storage._internalReadBytes(DATA_TYPE_RESULT, 0, i);
      results[i] = { success: isOk, buffer: buffer };
    }
    return results;
  }
}

export class ContractPromiseResult {
  success: bool;
  buffer: Uint8Array;
}

// TODO: Other functions exposed by runtime should be defined here

@external("env", "storage_write")
declare function storage_write(key_len: usize, key_ptr: usize, value_len: usize, value_ptr: usize): void;
@external("env", "storage_remove")
declare function storage_remove(key_len: usize, key_ptr: usize): void;
@external("env", "storage_has_key")
declare function storage_has_key(key_len: usize, key_ptr: usize): bool;
@external("env", "storage_iter")
declare function storage_iter(prefix_len: usize, prefix_ptr: usize): u32;
@external("env", "storage_iter_next")
declare function storage_iter_next(id: u32): u32;

@external("env", "result_count")
declare function result_count(): u32;
@external("env", "result_is_ok")
declare function result_is_ok(index: u32): bool;

@external("env", "return_value")
declare function return_value(value_len: usize, value_ptr: usize): void;
@external("env", "return_promise")
declare function return_promise(promise_index: u32): void;

@external("env", "data_read")
declare function data_read(type_index: u32, key_len: usize, key: usize, max_buf_len: usize, buf_ptr: usize): usize;

@external("env", "promise_create")
declare function promise_create(
    account_id_len: usize, account_id_ptr: usize,
    method_name_len: usize, method_name_ptr: usize,
    args_len: usize, args_ptr: usize,
    mana: u32,
    amount: u64): u32;

@external("env", "promise_then")
declare function promise_then(
    promise_index: u32,
    method_name_len: usize, method_name_ptr: usize,
    args_len: usize, args_ptr: usize,
    mana: u32): u32;

@external("env", "promise_and")
declare function promise_and(promise_index1: u32, promise_index2: u32): u32;

/**
 * @hidden
 * Hash buffer is 32 bytes
 */
@external("env", "hash")
declare function _near_hash(value_len: usize, value_ptr: usize, buf_ptr: usize): void;

/**
 * @hidden
 */
@external("env", "hash32")
declare function _near_hash32(value_len: usize, value_ptr: usize): u32;

/**
 * @hidden
 * Fills given buffer with random u8.
 */
@external("env", "random_buf")
declare function _near_random_buf(buf_len: u32, buf_ptr: usize): void

/**
 * @hidden
 */
@external("env", "random32")
declare function random32(): u32;

/**
 * @hidden
 */
@external("env", "log")
declare function _near_log(msg_ptr: usize): void;

/**
 * @hidden
 */
@external("env", "balance")
declare function balance(): u64;

/**
 * @hidden
 */
@external("env", "mana_left")
declare function mana_left(): u32;

/**
 * @hidden
 */
@external("env", "gas_left")
declare function gas_left(): u64;

/**
 * @hidden
 */
@external("env", "received_amount")
declare function received_amount(): u64;

/**
 * @hidden
 */
@external("env", "block_index")
declare function block_index(): u64;

/*
    fn storage_write(key_len: usize, key_ptr: *const u8, value_len: usize, value_ptr: *const u8);
    fn storage_remove(key_len: usize, key_ptr: *const u8);
    fn storage_has_key(key_len: usize, key_ptr: *const u8) -> bool;

    fn result_count() -> u32;
    fn result_is_ok(index: u32) -> bool;

    fn return_value(value_len: usize, value_ptr: *const u8);
    fn return_promise(promise_index: u32);

    fn data_read(data_type_index: u32, key_len: usize, key_ptr: *const u8, max_buf_len: usize, buf_ptr: *mut u8) -> usize;

    // AccountID is just 32 bytes without the prefix length.
    fn promise_create(
        account_id_len: usize, account_id_ptr: *const u8,
        method_name_len: usize, method_name_ptr: *const u8,
        arguments_len: usize, arguments_ptr: *const u8,
        mana: u32,
        amount: u64,
    ) -> u32;

    fn promise_then(
        promise_index: u32,
        method_name_len: usize, method_name_ptr: *const u8,
        arguments_len: usize, arguments_ptr: *const u8,
        mana: u32,
    ) -> u32;

    fn promise_and(promise_index1: u32, promise_index2: u32) -> u32;

    fn balance() -> u64;
    fn mana_left() -> u32;
    fn gas_left() -> u64;
    fn received_amount() -> u64;
    fn assert(expr: bool);

    /// Hash buffer is 32 bytes
    fn hash(value_len: usize, value_ptr: *const u8, buf_ptr: *mut u8);
    fn hash32(value_len: usize, value_ptr: *const u8) -> u32;

    // Fills given buffer with random u8.
    fn random_buf(buf_len: u32, buf_ptr: *mut u8);
    fn random32() -> u32;

    fn block_index() -> u64;

    /// Log using utf-8 string format.
    fn debug(msg_len: usize, msg_ptr: *const u8);
*/
